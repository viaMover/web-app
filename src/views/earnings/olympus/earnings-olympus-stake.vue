<template>
  <secondary-page
    class="stake"
    :has-back-button="showBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="currentStep === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="$t('earnings.olympus.txtStakeDescription')"
      :header-title="$t('earnings.olympus.lblStake')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('earnings.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('earnings.olympus.txtPotentialEarnings')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('earnings.lblAmountWeDepositIn')"
      :selected-token-description="inputAssetDescription"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleReviewTx"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    >
      <template v-slot:swap-message>
        <div
          v-if="isSwapNeeded && formattedOhmTotal && inputMode === 'TOKEN'"
          class="form-swap"
        >
          <p>
            {{ $t('forms.lblSwappingFor') }}
            <token-image
              :address="ohmAssetData.address"
              :src="ohmAssetData.iconURL"
              :symbol="ohmAssetData.symbol"
              wrapper-class="token"
            />
            <span>{{ formattedOhmTotal }}</span>
          </p>
        </div>
      </template>
    </prepare-form>
    <review-form
      v-else-if="currentStep === 'review'"
      :amount="inputAmount"
      :button-text="reviewActionButtonText"
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('earnings.lblReviewYourStake')"
      :image="stake"
      :input-amount-native-title="$t('earnings.lblAndTotalOf')"
      :input-amount-title="$t('earnings.lblAmountWeDepositIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="formattedNativeAmount"
      :token="inputAsset"
      @tx-start="handleCreateTx"
    />
    <loader-form v-else-if="currentStep === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { getTransferData, TransferData } from '@/services/0x/api';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import { divide, fromWei, isZero, multiply, toWei } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { isSubsidizedAllowed } from '@/wallet/actions/subsidized';
import { getOhmAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import {
  InputMode,
  LoaderForm,
  PrepareForm,
  ReviewForm
} from '@/components/forms';
import { Step as TransactionStep } from '@/components/forms/form-loader';
import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout';
import { TokenImage } from '@/components/tokens';

type processStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'EarningsOlympusStake',
  components: {
    TokenImage,
    ReviewForm,
    PrepareForm,
    LoaderForm,
    SecondaryPage
  },
  props: {
    currentStep: {
      type: String as PropType<processStep>,
      default: 'prepare'
    }
  },
  data() {
    return {
      stake: {
        alt: this.$t('earnings.olympus.txtStakePictureAlt'),
        src: require('@/assets/images/earnings-ethereum-and-olympus@1x.png'),
        sources: [
          {
            src: require('@/assets/images/earnings-ethereum-and-olympus@1x.png')
          },
          {
            variant: '2x',
            src: require('@/assets/images/earnings-ethereum-and-olympus@2x.png')
          }
        ]
      } as PictureDescriptor,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '' as string,
      inputAmountNative: '' as string,
      inputMode: 'TOKEN' as InputMode,
      isTokenSelectedByUser: false,
      isLoading: false,
      isProcessing: false,
      transferError: undefined as undefined | string,
      formattedOhmTotal: '',
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined,
      isSubsidizedEnabled: true,
      transactionStep: 'Confirm' as TransactionStep,
      debounce: undefined as number | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      nativeCurrency: 'nativeCurrency',
      gasPrices: 'gasPrices'
    }),
    ...mapState('earnings/olympus', {
      olympusBalance: 'olympusBalance',
      olympusAPY: 'olympusAPY',
      ohmNativePrice: 'ohmNativePrice'
    }),
    ...mapGetters('account', {
      treasuryBonusNative: 'treasuryBonusNative',
      currentNetworkBaseTokenPrice: 'currentNetworkBaseTokenPrice'
    }),
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    showBackButton(): boolean {
      return this.currentStep !== 'loader';
    },
    estimatedAnnualEarnings(): string {
      let possibleSavingsBalance = '0';

      if (this.olympusBalance !== undefined) {
        possibleSavingsBalance = this.olympusBalance;
      }

      if (possibleSavingsBalance === '0') {
        return `~ $${formatToNative(0)}`;
      }

      const usdcNative = multiply(
        this.ohmNativePrice,
        this.currentNetworkBaseTokenPrice
      );
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      let apyNative = multiply(divide(this.olympusAPY, 100), usdcAmountNative);

      return `~ $${formatToNative(apyNative)}`;
    },
    ohmAssetData(): SmallTokenInfoWithIcon {
      return getOhmAssetData(this.networkInfo.network);
    },
    inputAssetDescription(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      if (sameAddress(this.inputAsset.address, this.ohmAssetData.address)) {
        return this.$t('earnings.olympus.txtNativeAsset', {
          symbol: this.ohmAssetData.symbol
        }) as string;
      }

      return this.$t('earnings.txtNotNativeAsset', {
        targetSymbol: this.ohmAssetData.symbol
      }) as string;
    },
    reviewActionButtonText(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return this.$t('earnings.btnStake', {
        symbol: this.inputAsset.symbol
      }) as string;
    },
    isSwapNeeded(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(this.inputAsset.address, this.ohmAssetData.address);
    }
  },
  watch: {
    inputAmount: {
      async handler(newVal: string) {
        this.isProcessing = true;
        await this.formatOHMTotal(newVal);
        this.isProcessing = false;
      }
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    async calcSwap(
      inputAsset: Pick<SmallToken, 'decimals' | 'address'>,
      outputAsset: Pick<SmallToken, 'decimals' | 'address'>,
      amount: string
    ): Promise<TransferData> {
      const inputInWei = toWei(amount, inputAsset.decimals);
      return await getTransferData(
        outputAsset.address,
        inputAsset.address,
        inputInWei,
        true,
        '10',
        this.networkInfo.network
      );
    },
    async formatOHMTotal(input: string): Promise<void> {
      if (this.inputAsset === undefined || input === '') {
        this.formattedOhmTotal = `0 ${this.ohmAssetData.symbol}`;
        return;
      }

      if (sameAddress(this.inputAsset.address, this.ohmAssetData.address)) {
        this.formattedOhmTotal = `${formatToNative(input)} ${
          this.ohmAssetData.symbol
        }`;
        return;
      }

      const transferData = await this.calcSwap(
        this.inputAsset,
        this.ohmAssetData,
        input
      );
      const ohm = fromWei(transferData.buyAmount, this.ohmAssetData.decimals);

      this.formattedOhmTotal = `${formatToNative(ohm)} ${
        this.ohmAssetData.symbol
      }`;
    },
    async handleOpenSelectModal(): Promise<void> {
      this.isLoading = true;

      const newAsset = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true
        }
      });

      if (newAsset !== undefined) {
        this.inputAsset = newAsset;
        this.inputAmount = '';
        this.inputAmountNative = '';
        this.isTokenSelectedByUser = true;
      }

      this.isLoading = false;
    },
    checkSubsidizedAvailability(actionGasLimit: string): boolean {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      if (
        isZero(gasPrice) ||
        isZero(actionGasLimit) ||
        isZero(this.currentNetworkBaseTokenPrice)
      ) {
        console.log(
          "With empty parameter we don't allow subsidized transaction"
        );
        return false;
      }

      if (this.inputAsset?.address === 'eth') {
        console.info('Subsidizing for deposit ETH denied');
        return false;
      }

      return isSubsidizedAllowed(
        gasPrice,
        actionGasLimit,
        this.currentNetworkBaseTokenPrice,
        this.treasuryBonusNative
      );
    },
    handleReviewTx(): void {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.isProcessing = true;
      try {
        // plain code HERE
      } catch (err) {
        this.isSubsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate earnings deposit for subs");
        return;
      } finally {
        this.isProcessing = false;
      }
      this.changeStep('review');
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }

      this.inputMode = 'NATIVE';
    },
    handleSelectMaxAmount(): void {
      if (this.inputAsset === undefined) {
        return;
      }

      this.inputAmount = this.inputAsset.balance;
      this.inputAmountNative = multiply(
        this.inputAsset.balance,
        this.inputAsset.priceUSD
      );
    },
    handleUpdateAmount(amount: string): void {
      if (this.inputAsset === undefined) {
        return;
      }

      if (this.inputMode === 'TOKEN') {
        this.inputAmount = amount;
        this.inputAmountNative = multiply(amount, this.inputAsset.priceUSD);
        return;
      }

      this.inputAmountNative = amount;
      this.inputAmount = divide(amount, this.inputAsset.priceUSD);
    },
    handleCreateTx(args: { isSmartTreasury: boolean }): void {
      this.changeStep('loader');
    },
    handleBack(): void {
      if (this.currentStep === 'review') {
        this.$router.back();
        return;
      }

      this.$router.replace({ name: 'earnings-olympus-manage' });
    },
    changeStep(target: processStep): void {
      const routerArgs: RawLocation = {
        name: 'earnings-olympus-stake',
        params: { step: target }
      };

      if (this.currentStep === 'review') {
        this.$router.replace(routerArgs);
        return;
      }

      this.$router.push(routerArgs);
    },
    changeTransactionStep(target: TransactionStep): void {
      this.transactionStep = target;
    }
  }
});
</script>
