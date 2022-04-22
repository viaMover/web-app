<template>
  <secondary-page
    class="deposit"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="
        $t('treasury.decreaseBoost.txtDecreaseBoostPageDescription')
      "
      :header-title="$t('savings.deposit.lblDepositInSavings')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('savings.deposit.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('savings.deposit.txtYouCouldEarnInYear')"
      :operation-title="estimatedAnnualEarning"
      :output-asset-heading-text="$t('savings.deposit.lblAmountWeDepositIn')"
      :selected-token-description="description"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    >
      <template v-slot:swap-message>
        <div
          v-if="isSwapNeeded && formattedUSDCTotal && inputMode === 'TOKEN'"
          class="section swap-message"
        >
          {{ $t('forms.lblSwappingFor') }}
          <custom-picture
            :alt="$t('lblTokenAlt', { symbol: 'USDc' })"
            class="token-icon inline"
            :sources="usdcPicture.sources"
            :src="usdcPicture.src"
          />
          <span>{{ formattedUSDCTotal }}</span>
        </div>
      </template>
    </prepare-form>
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('savings.deposit.lblDepositInSavings')"
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('savings.deposit.lblReviewYourDeposit')"
      :image="savings"
      :input-amount-native-title="$t('savings.deposit.lblAndTotalOf')"
      :input-amount-title="$t('savings.deposit.lblAmountWeDepositIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="formattedNativeAmount"
      :token="inputAsset"
      @tx-start="handleTxStart"
    />
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { MoverError } from '@/services/v2';
import { TransferData, ZeroXAPIService } from '@/services/v2/api/0x';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { isBaseAsset, sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  isZero,
  multiply,
  toWei
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import { getUSDCAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import {
  InputMode,
  LoaderForm,
  LoaderStep,
  PrepareForm,
  ReviewForm
} from '@/components/forms';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'SavingsDepositWrapper',
  components: {
    CustomPicture,
    ReviewForm,
    PrepareForm,
    LoaderForm,
    SecondaryPage
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      //current
      step: 'prepare' as ProcessStep,
      transactionStep: undefined as LoaderStep | undefined,
      savings: {
        alt: this.$t('savings.lblSavings'),
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor,
      usdcPicture: {
        src: require('@/assets/images/USDC.png'),
        sources: [
          {
            src: require('@/assets/images/USDC@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,

      //prepare
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '',
      inputAmountNative: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,

      //to tx
      isSubsidizedEnabled: false,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      nativeCurrency: 'nativeCurrency',
      gasPrices: 'gasPrices',
      usdcPriceInWeth: 'usdcPriceInWeth',
      provider: 'provider',
      swapService: 'swapAPIService'
    }),
    ...mapGetters('treasury', { treasuryBonusNative: 'treasuryBonusNative' }),
    ...mapGetters('account', {
      currentNetworkBaseTokenPrice: 'currentNetworkBaseTokenPrice',
      currentNetworkWalletTokens: 'currentNetworkWalletTokens'
    }),
    ...mapState('savings', {
      savingsAPY: 'savingsAPY',
      savingsBalance: 'savingsBalance',
      savingsOnChainService: 'onChainService'
    }),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    isSwapNeeded(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(
        this.inputAsset.address,
        this.outputUSDCAsset.address
      );
    },
    description(): string {
      return (
        this.isSwapNeeded
          ? this.$t('savings.deposit.txtAssetWillBeConverted')
          : this.$t('savings.txtUSDCCoinIsAStable')
      ) as string;
    },
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    estimatedAnnualEarning(): string {
      let possibleSavingsBalance = '0';
      if (
        this.inputAsset &&
        sameAddress(this.inputAsset.address, this.outputUSDCAsset.address)
      ) {
        possibleSavingsBalance = this.inputAmount;
      } else if (this.transferData !== undefined) {
        possibleSavingsBalance = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      }

      if (this.savingsBalance !== undefined) {
        possibleSavingsBalance = add(
          this.savingsBalance,
          possibleSavingsBalance
        );
      }

      const usdcNative = multiply(
        this.usdcPriceInWeth,
        this.currentNetworkBaseTokenPrice
      );
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      const apyNative = multiply(
        divide(this.savingsAPY, 100),
        usdcAmountNative
      );

      return `~ $${formatToNative(apyNative)}`;
    },
    formattedUSDCTotal(): string {
      if (this.inputAsset === undefined) {
        return '0 USDC';
      }

      if (sameAddress(this.inputAsset.address, this.outputUSDCAsset.address)) {
        return `${formatToNative(this.inputAmount)} USDC`;
      }

      if (this.transferData !== undefined) {
        const boughtUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
        return `${formatToNative(boughtUSDC)} USDC`;
      }

      return '';
    },
    isNeedTransfer(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(
        this.inputAsset.address,
        this.outputUSDCAsset.address
      );
    }
  },
  watch: {
    currentNetworkWalletTokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (this.isTokenSelectedByUser) {
            return;
          }
          const eth = newVal.find((t: TokenWithBalance) =>
            isBaseAsset(t.address, this.networkInfo.network)
          );
          if (eth) {
            this.inputAsset = eth;
          }
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    handleBack(): void {
      if (this.step === 'review') {
        this.step = 'prepare';
      } else {
        this.$router.back();
      }
    },
    async handleTxReview(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmount,
          this.inputAsset,
          this.transferData
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;

        if (!isZero(this.actionGasLimit)) {
          this.isSubsidizedEnabled = await this.checkSubsidizedAvailability(
            this.actionGasLimit
          );
          this.estimatedGasCost = this.subsidizedTxNativePrice(
            this.actionGasLimit
          );
        }
      } catch (error) {
        console.warn('Failed to estimate transaction', error);
        Sentry.captureException(error);
        this.isSubsidizedEnabled = false;
        return;
      } finally {
        this.isProcessing = false;
      }

      this.step = 'review';
    },
    subsidizedTxNativePrice(actionGasLimit: string): string | undefined {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      if (
        isZero(gasPrice) ||
        isZero(actionGasLimit) ||
        isZero(this.currentNetworkBaseTokenPrice)
      ) {
        return undefined;
      }

      return (
        this.savingsOnChainService as SavingsOnChainService
      ).calculateTransactionNativePrice(
        gasPrice,
        actionGasLimit,
        this.currentNetworkBaseTokenPrice
      );
    },
    async checkSubsidizedAvailability(
      actionGasLimit: string
    ): Promise<boolean> {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';

      if (
        isZero(gasPrice) ||
        isZero(actionGasLimit) ||
        isZero(this.currentNetworkBaseTokenPrice)
      ) {
        return false;
      }
      if (
        isBaseAsset(this.inputAsset?.address ?? '', this.networkInfo.network)
      ) {
        return false;
      }

      try {
        return await (
          this.savingsOnChainService as SavingsOnChainService
        ).isSubsidizedTransactionAllowed(
          gasPrice,
          actionGasLimit,
          this.currentNetworkBaseTokenPrice
        );
      } catch (error) {
        console.warn(
          'Failed to check if subsidized transaction is allowed',
          error
        );
        Sentry.captureException(error);
        return false;
      }
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken,
      transferData: TransferData | undefined
    ): Promise<CompoundEstimateResponse> {
      try {
        const estimation = await (
          this.savingsOnChainService as SavingsOnChainService
        ).estimateDepositCompound(
          inputAsset,
          this.outputUSDCAsset,
          inputAmount,
          transferData
        );

        if (estimation.error) {
          throw new Error('Failed to estimate action');
        }

        return estimation;
      } catch (error) {
        this.transferError = this.$t('estimationError') as string;
        throw error;
      }
    },
    async handleUpdateAmount(val: string): Promise<void> {
      await this.updateAmount(val, this.inputMode);
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        if (!this.isSwapNeeded) {
          this.transferData = undefined;
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = convertNativeAmountFromAmount(
              value,
              this.inputAsset.priceUSD
            );
          } else {
            this.inputAmount = convertAmountFromNativeValue(
              value,
              this.inputAsset.priceUSD,
              this.inputAsset.decimals
            );
            this.inputAmountNative = value;
          }
        } else {
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = new BigNumber(
              convertNativeAmountFromAmount(value, this.inputAsset.priceUSD)
            ).toFixed(2);
            const inputInWei = toWei(value, this.inputAsset.decimals);
            this.transferData = await (
              this.swapService as ZeroXAPIService
            ).getTransferData(
              this.outputUSDCAsset.address,
              this.inputAsset.address,
              inputInWei,
              true,
              '10'
            );
            this.transferError = undefined;
          } else {
            this.inputAmountNative = value;
            const inputInWei = toWei(
              convertAmountFromNativeValue(
                value,
                this.inputAsset.priceUSD,
                this.inputAsset.decimals
              ),
              this.inputAsset.decimals
            );
            this.transferData = await (
              this.swapService as ZeroXAPIService
            ).getTransferData(
              this.outputUSDCAsset.address,
              this.inputAsset.address,
              inputInWei,
              true,
              '10'
            );
            this.transferError = undefined;
            this.inputAmount = fromWei(
              this.transferData.sellAmount,
              this.inputAsset.decimals
            );
          }
        }
      } catch (error) {
        if (error instanceof MoverError) {
          this.transferError = (
            this.swapService as ZeroXAPIService
          ).mapErrorMessage(error.message, this.$i18n);
        } else {
          this.transferError = this.$t('exchangeError') as string;
        }

        Sentry.captureException(error);
        console.error(`Transfer error`, error);
        this.transferData = undefined;
        if (mode === 'TOKEN') {
          this.inputAmountNative = '0';
        } else {
          this.inputAmount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true
        }
      });

      if (token === undefined) {
        return;
      }
      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.transferData = undefined;
      this.transferError = undefined;
      this.inputAmount = '';
      this.inputAmountNative = '';
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }
      if (this.inputMode === 'TOKEN') {
        await this.updateAmount(this.inputAsset.balance, 'TOKEN');
      } else {
        await this.updateAmount(
          new BigNumber(
            multiply(this.inputAsset.balance, this.inputAsset.priceUSD)
          ).toFixed(2, BigNumber.ROUND_DOWN),
          'NATIVE'
        );
      }
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.inputAsset === undefined) {
        console.error('inputAsset is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.isNeedTransfer && this.transferData === undefined) {
        console.error(
          'transfer data is empty during `handleTxStart` when it is needed'
        );
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.savingsOnChainService as SavingsOnChainService
        ).depositCompound(
          this.inputAsset,
          this.outputUSDCAsset,
          this.inputAmount,
          this.transferData,
          args.isSmartTreasury,
          async () => {
            this.transactionStep = 'Process';
          },
          this.actionGasLimit,
          this.approveGasLimit
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        this.transactionStep = 'Reverted';
        console.error('Failed to deposit', error);
        Sentry.captureException(error);
      }
    }
  }
});
</script>
