<template>
  <secondary-page
    :has-back-button="showBackButton"
    hide-title
    @back="handleBack"
  >
    <div v-if="showPageTitle">
      <secondary-page-simple-title
        class="savings_secondary_page-title"
        :description="pageDescription"
        :title="pageTitle"
      />
      <div
        v-if="showPotentialEarnings"
        class="savings_secondary_page-token-info"
      >
        <span>{{ estimatedAnnualEarnings }}</span>
        <p>{{ $t('earnings.olympus.txtPotentialEarnings') }}</p>
      </div>
    </div>
    <deposit-form
      v-if="currentStep === 'prepare'"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset="inputAsset"
      :input-asset-description="inputAssetDescription"
      :input-asset-heading="$t('earnings.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :output-asset-heading-text="$t('earnings.lblAmountWeDepositIn')"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleReviewTx"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    >
    </deposit-form>
    <deposit-review-form
      v-else-if="currentStep === 'review'"
      :action-button-text="reviewActionButtonText"
      :estimated-gas-cost="estimatedGasCost"
      :input-amount-text="reviewInputAmountText"
      :input-asset="inputAsset"
      :input-asset-heading="$t('earnings.lblAmountWeDepositIn')"
      :input-asset-symbol="reviewInputAssetSymbol"
      :is-smart-treasury="isSmartTreasury"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :output-amount-text="reviewOutputAmountText"
      :output-asset-heading="$t('earnings.lblAndItWillBe')"
      :output-asset-symbol="reviewOutputAssetSymbol"
      @create-tx="handleCreateTx"
      @update-is-smart-treasury="handleUpdateIsSmartTreasury"
    >
    </deposit-review-form>
    <form-loader v-else-if="currentStep === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { mapActions, mapState } from 'vuex';

import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import { divide, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getOhmAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import {
  DepositForm,
  DepositReviewForm,
  FormLoader,
  INPUT_MODE
} from '@/components/forms';
import { Step as TransactionStep } from '@/components/forms/form-loader';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';

type processStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'EarningsOlympusStake',
  components: {
    DepositForm,
    DepositReviewForm,
    FormLoader,
    SecondaryPage,
    SecondaryPageSimpleTitle
  },
  props: {
    currentStep: {
      type: String as PropType<processStep>,
      default: 'prepare'
    }
  },
  data() {
    return {
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '' as string,
      inputAmountNative: '' as string,
      inputMode: 'TOKEN' as INPUT_MODE,
      isTokenSelectedByUser: false,
      isLoading: false,
      isProcessing: false,
      transferError: undefined as string | undefined,
      estimatedGasCost: undefined as string | undefined,
      isSmartTreasury: false,
      isSubsidizedEnabled: true,
      transactionStep: 'Confirm' as TransactionStep
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      nativeCurrency: 'nativeCurrency',
      tokens: 'tokens'
    }),
    showBackButton(): boolean {
      return this.currentStep === 'review';
    },
    showPotentialEarnings(): boolean {
      return this.currentStep === 'prepare';
    },
    showPageTitle(): boolean {
      return ['prepare', 'review'].includes(this.currentStep);
    },
    pageTitle(): string {
      switch (this.currentStep) {
        case 'prepare':
          return this.$t('earnings.olympus.lblStake') as string;
        case 'review':
          return this.$t('earnings.lblReviewYourStake') as string;
        default:
          return '';
      }
    },
    pageDescription(): string {
      if (this.currentStep === 'prepare') {
        return this.$t('earnings.olympus.txtStakeDescription') as string;
      }

      return '';
    },
    estimatedAnnualEarnings(): string {
      return `~$${formatToNative(0)}`;
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
    reviewInputAssetSymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    reviewOutputAssetSymbol(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return this.inputAsset.symbol;
    },
    reviewInputAmountText(): string {
      return `${formatToNative(
        this.inputAmountNative
      )} ${this.nativeCurrency.toUpperCase()}`;
    },
    reviewOutputAmountText(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return `${formatToNative(this.inputAmount)}`;
    }
  },
  watch: {
    tokens: {
      handler(newVal: Array<TokenWithBalance>) {
        if (this.isTokenSelectedByUser) {
          return;
        }

        this.isLoading = true;
        const ohmTokenInWallet = newVal.find((token) =>
          sameAddress(this.ohmAssetData.address, token.address)
        );
        if (ohmTokenInWallet === undefined) {
          this.isLoading = false;
          return;
        }

        this.inputAsset = ohmTokenInWallet;
        this.inputAmount = '';
        this.inputAmountNative = '';
        this.isLoading = false;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
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
    handleReviewTx(): void {
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
    handleCreateTx(): void {
      this.changeStep('loader');
    },
    handleUpdateIsSmartTreasury(value: boolean): void {
      this.isSmartTreasury = value;
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
