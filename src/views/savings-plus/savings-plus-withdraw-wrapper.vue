<template>
  <secondary-page
    class="withdraw"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('savingsPlus.withdraw.txtWithdrawDescription')"
      :header-title="$t('savingsPlus.withdraw.lblWithdrawFromSP')"
      :input-amount="inputAmountNative"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('savingsPlus.withdraw.lblWhatDoWeWithdraw')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      is-multichain
      :is-processing="isProcessing"
      :operation-description="$t('savingsPlus.withdraw.txtIfYouKeepSavings')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="
        $t('savingsPlus.withdraw.lblAmountWeWithdrawIn')
      "
      :selected-token-description="
        $t('savingsPlus.withdraw.txtTokenDescription')
      "
      :transfer-error="transferError"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmountNative"
      :button-text="$t('savingsPlus.btn.withdrawFromSP')"
      :header-title="$t('savingsPlus.withdraw.lblReviewYourWithdraw')"
      :image="savings"
      :input-amount-native-title="$t('savingsPlus.withdraw.lblTotalAmountBack')"
      :input-amount-title="$t('savingsPlus.withdraw.lblAmountWeWithdrawIn')"
      :native-amount="formattedNativeAmount"
      :token="inputAsset"
      @tx-start="handleTxStart"
    >
      <template v-slot:additional-items>
        <div class="item">
          <h2>
            {{ $t('savingsPlus.withdraw.lblIncludingAccumulatedInterest') }}
          </h2>
          <span>{{ includingAccumulatedInterest }}</span>
        </div>
      </template>
    </review-form>
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { TransferData } from '@/services/0x/api';
import { stableCoinForNetwork } from '@/settings';
import { divide, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
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
import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'SavingsPlusWithdrawWrapper',
  components: {
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

      //prepare
      isLoading: false,
      isProcessing: false,
      inputMode: 'TOKEN' as InputMode,
      inputAmountNative: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,

      //to tx
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      provider: 'provider',
      ethPrice: 'ethPrice',
      gasPrices: 'gasPrices',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapState('savingsPlus', {
      APY: 'APY',
      balance: 'balance'
    }),
    ...mapGetters('treasury', {
      treasuryBonusNative: 'treasuryBonusNative'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    includingAccumulatedInterest(): string {
      return `1.21 USDc`;
    },
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    stableCoinAsset(): SmallTokenInfoWithIcon {
      const token = stableCoinForNetwork(this.networkInfo.network);
      if (token === undefined) {
        //never case
        return { address: '0x1', decimals: 0, iconURL: '', symbol: 'Token' };
      }

      return token;
    },
    inputAsset(): TokenWithBalance {
      return {
        address: this.stableCoinAsset.address,
        decimals: this.stableCoinAsset.decimals,
        symbol: this.stableCoinAsset.symbol,
        name: 'USD Coin',
        priceUSD: this.usdcNativePrice,
        logo: this.stableCoinAsset.iconURL,
        balance: '120',
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    estimatedAnnualEarnings(): string {
      let possibleSavingsBalance = '0';

      if (this.balance !== undefined) {
        possibleSavingsBalance = this.balance;
      }

      const usdcAmountNative = multiply(
        possibleSavingsBalance,
        this.usdcNativePrice
      );
      let apyNative = multiply(divide(this.APY, 100), usdcAmountNative);

      return `~ $${formatToNative(apyNative)}`;
    }
  },
  methods: {
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
    async estimateAction(
      amount: string,
      asset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      return { error: false, actionGasLimit: '0', approveGasLimit: '0' };
    },
    async handleTxReview(): Promise<void> {
      this.actionGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmountNative,
          this.inputAsset
        );

        this.actionGasLimit = gasLimits.actionGasLimit;

        console.info(
          'Savings Plus withdraw action gaslimit:',
          this.actionGasLimit
        );
      } catch (err) {
        console.error(err);
        Sentry.captureException(err);
        // Sentry.captureException("can't estimate savings deposit for subs");
      } finally {
        this.isProcessing = false;
      }

      this.step = 'review';
    },
    handleSelectMaxAmount(): void {
      this.inputAmountNative = this.inputAsset.balance;
    },
    handleUpdateAmount(val: string): void {
      this.inputAmountNative = val;
    },
    async handleTxStart(): Promise<void> {
      if (this.inputAmountNative === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings withdraw TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings withdraw TX");
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        // await withdrawCompound(
        //   this.inputAsset,
        //   this.inputAmountNative,
        //   this.networkInfo.network,
        //   this.provider.web3,
        //   this.currentAddress,
        //   this.actionGasLimit,
        //   args.isSmartTreasury,
        //   async () => {
        //     this.transactionStep = 'Process';
        //   }
        // );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (err) {
        this.transactionStep = 'Reverted';
        console.log('Savings withdraw swap reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
