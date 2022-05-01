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
      :header-description="$t('savingsPlus.deposit.txtDepositDescription')"
      :header-title="$t('savingsPlus.deposit.lblDepositInSP')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('savingsPlus.deposit.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      is-multichain
      :is-processing="isProcessing"
      :operation-description="$t('savingsPlus.deposit.txtYouCouldEarnInYear')"
      :operation-title="estimatedAnnualEarning"
      :output-asset-heading-text="
        $t('savingsPlus.deposit.lblAmountWeDepositIn')
      "
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
      :button-text="$t('savingsPlus.deposit.lblDepositInSP')"
      :header-title="$t('savingsPlus.deposit.lblReviewYourDeposit')"
      :image="savings"
      :input-amount-native-title="$t('savingsPlus.deposit.lblTotalGoesInSP')"
      :input-amount-title="$t('savingsPlus.deposit.lblYourDepositIn')"
      :native-amount="receiveAmountNative"
      :token="inputAsset"
      @tx-start="handleTxStart"
    >
      <template v-slot:additional-items>
        <div class="item">
          <h2>{{ $t('savingsPlus.deposit.lblDepositingFrom') }}</h2>
          <span> {{ formattedNetworkInfo }}</span>
        </div>
        <div class="item">
          <h2>{{ $t('savingsPlus.deposit.lblBridgingFee') }}</h2>
          <span> {{ bridgingFee }}</span>
        </div>
        <!--<div class="item">
                  <h2>{{ $t('savingsPlus.deposit.lblEstimatedVariableAPY') }}</h2>
                  <span>{{ estimatedVariableAPY }}</span>
                </div>-->
      </template>
    </review-form>
    <loader-form
      v-else-if="step === 'loader'"
      :additional-subtitle="successTxSubtitle"
      :step="transactionStep"
    >
      <template
        v-if="successTxSubtitle !== undefined"
        v-slot:additionalSubtitle
      >
        <div class="description">
          <span class="icon">👀</span>
          {{ successTxSubtitle }}
        </div>
      </template>
    </loader-form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { MoverError } from '@/services/v2';
import { TransferData, ZeroXAPIService } from '@/services/v2/api/0x';
import {
  DepositTransactionData,
  isDepositWithBridgeTransactionData,
  MoverAPISavingsPlusService
} from '@/services/v2/api/mover/savings-plus';
import { SavingsPlusOnChainService } from '@/services/v2/on-chain/mover/savings-plus';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { isBaseAsset, sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  lessThanOrEqual,
  multiply,
  sub,
  toWei
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

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
  name: 'SavingsPlusDepositWrapper',
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
        alt: this.$t('savingsPlus.lblSP'),
        src: require('@/assets/images/SavingsPlus@1x.png'),
        sources: [
          { src: require('@/assets/images/SavingsPlus@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/SavingsPlus@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/SavingsPlus@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SavingsPlus@2x.webp')
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
      depositTxData: undefined as DepositTransactionData | undefined,

      //review
      receiveAmountNative: '0',

      //to tx
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      nativeCurrency: 'nativeCurrency',
      tokens: 'tokens',
      provider: 'provider',
      swapService: 'swapAPIService'
    }),
    ...mapState('savingsPlus', {
      APY: 'APY',
      savingsPlusOnChainService: 'onChainService',
      savingsPlusApiService: 'apiService'
    }),
    ...mapGetters('savingsPlus', {
      balance: 'infoBalanceUSDC'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    formattedNetworkInfo(): string {
      return `${this.networkInfo.name}`;
    },
    bridgingFee(): string {
      if (isDepositWithBridgeTransactionData(this.depositTxData)) {
        return `${formatToDecimals(
          fromWei(this.depositTxData.bridgeFee, this.outputUSDCAsset.decimals),
          4
        )} ${this.outputUSDCAsset.symbol}`;
      }
      return `0 ${this.outputUSDCAsset.symbol}`;
    },
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    isBridgingNeeded(): boolean {
      return isDepositWithBridgeTransactionData(this.depositTxData);
    },
    successTxSubtitle(): string | undefined {
      if (this.isBridgingNeeded) {
        return this.$t('savingsPlus.lblTxAdditionalBridgeInfo') as string;
      }
      return undefined;
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
          ? this.$t('savingsPlus.deposit.txtAssetWillBeConverted')
          : this.$t('savingsPlus.deposit.txtUSDCCoinIsAStable')
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

      if (this.balance !== undefined) {
        possibleSavingsBalance = add(this.balance, possibleSavingsBalance);
      }

      const apyNative = multiply(
        divide(this.APY, 100),
        multiply(possibleSavingsBalance, this.usdcNativePrice)
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
    tokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (this.isTokenSelectedByUser) {
            return;
          }
          const baseAsset = newVal.find((t: TokenWithBalance) =>
            isBaseAsset(t.address, this.networkInfo.network)
          );
          if (baseAsset) {
            this.inputAsset = baseAsset;
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

      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.isProcessing = true;

      try {
        let receiveAmount = '0';
        if (this.transferData !== undefined) {
          receiveAmount = this.transferData?.buyAmount;
        } else if (!this.isSwapNeeded) {
          receiveAmount = toWei(this.inputAmount, this.inputAsset.decimals);
        } else {
          const error = new Error(
            "can't calculate receiveAmountNative for savings plus deposit"
          );
          Sentry.captureException(error);
          receiveAmount = '0';
          sendGlobalTopMessageEvent(
            this.$t('errors.default') as string,
            'error'
          );
          return;
        }

        this.depositTxData = await (
          this.savingsPlusApiService as MoverAPISavingsPlusService
        ).getDepositTransactionData(receiveAmount);

        if (isDepositWithBridgeTransactionData(this.depositTxData)) {
          receiveAmount = this.depositTxData.estimatedReceived;
        } else {
          receiveAmount = sub(receiveAmount, this.depositTxData.depositFee);
        }

        console.log('receiveAmount', receiveAmount);

        if (lessThanOrEqual(receiveAmount, '0')) {
          sendGlobalTopMessageEvent(
            this.$t('savingsPlus.deposit.lblNotEnough') as string,
            'error'
          );
          return;
        }

        const gasLimits = await (
          this.savingsPlusOnChainService as SavingsPlusOnChainService
        ).estimateDepositCompound(
          this.inputAsset,
          this.outputUSDCAsset,
          this.inputAmount,
          this.transferData,
          this.depositTxData
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;

        console.info(
          'SavingsPlus deposit action gaslimit:',
          this.actionGasLimit
        );
        console.info(
          'SavingsPlus deposit approve gaslimit:',
          this.approveGasLimit
        );

        const nativeReceiveAmount = multiply(
          fromWei(receiveAmount, this.outputUSDCAsset.decimals),
          this.usdcNativePrice
        );

        this.receiveAmountNative = `$${formatToNative(nativeReceiveAmount)}`;

        this.step = 'review';
      } catch (error) {
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        console.warn(
          'Failed to estimate savings plus deposit transaction',
          error
        );
        Sentry.captureException(error);
      } finally {
        this.isProcessing = false;
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
          console.log('Dont need transfer, token is USDC');
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
        console.error(`transfer error:`, error);
        this.transferData = undefined;
        if (mode === 'TOKEN') {
          this.inputAmountNative = '0';
        } else {
          this.inputAmount = '0';
        }
      }

      this.isLoading = false;
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
      this.depositTxData = undefined;
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
    async handleTxStart(): Promise<void> {
      if (this.inputAsset === undefined) {
        console.error('inputAsset is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus deposit TX");
        return;
      }

      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus  deposit TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus deposit TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus deposit TX");
        return;
      }

      if (this.isNeedTransfer && this.transferData === undefined) {
        console.error(
          'transfer data is empty during `handleTxStart` when it is needed'
        );
        Sentry.captureException("can't start savings plus deposit TX");
        return;
      }

      if (this.depositTxData === undefined) {
        console.error(
          'deposit tx data is empty during `handleTxStart` when it is needed'
        );
        Sentry.captureException("can't start savings plus deposit TX");
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.savingsPlusOnChainService as SavingsPlusOnChainService
        ).depositCompound(
          this.inputAsset,
          this.outputUSDCAsset,
          this.inputAmount,
          this.transferData,
          this.depositTxData,
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
