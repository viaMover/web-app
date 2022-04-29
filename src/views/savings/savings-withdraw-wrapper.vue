<template>
  <secondary-page
    class="withdraw"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('savings.withdraw.txtWithdrawDescription')"
      :header-title="$t('savings.withdraw.lblWithdrawFromSavings')"
      :input-amount="inputAmountNative"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('savings.withdraw.lblWhatDoWeWithdraw')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('savings.withdraw.txtIfYouKeepSavings')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('savings.withdraw.lblAmountWeDepositIn')"
      :selected-token-description="$t('savings.txtUSDCCoinIsAStable')"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmountNative"
      :button-text="$t('savings.withdraw.lblWithdrawFromSavings')"
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('savings.withdraw.lblReviewYourWithdraw')"
      :image="savings"
      :input-amount-native-title="$t('savings.withdraw.lblAndTotalOf')"
      :input-amount-title="$t('savings.withdraw.lblAmountWeWithdrawIn')"
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

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { isBaseAsset } from '@/utils/address';
import { divide, isZero, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
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
import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'SavingsWithdrawWrapper',
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
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAmountNative: '',

      //to tx
      isSubsidizedEnabled: false,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      usdcPriceInWeth: 'usdcPriceInWeth',
      provider: 'provider',
      ethPrice: 'ethPrice',
      gasPrices: 'gasPrices',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapState('savings', {
      savingsAPY: 'savingsAPY',
      savingsBalance: 'savingsBalance',
      savingsOnChainService: 'onChainService'
    }),
    ...mapGetters('treasury', {
      treasuryBonusNative: 'treasuryBonusNative',
      usdcNativePrice: 'usdcNativePrice'
    }),
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
    USDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    inputAsset(): TokenWithBalance {
      return {
        address: this.USDCAsset.address,
        decimals: this.USDCAsset.decimals,
        symbol: this.USDCAsset.symbol,
        name: 'USD Coin',
        priceUSD: this.usdcNativePrice,
        logo: this.USDCAsset.iconURL,
        balance: this.savingsBalance,
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    estimatedAnnualEarnings(): string {
      let possibleSavingsBalance = '0';

      if (this.savingsBalance !== undefined) {
        possibleSavingsBalance = this.savingsBalance;
      }

      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      let apyNative = multiply(divide(this.savingsAPY, 100), usdcAmountNative);

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
    subsidizedTxNativePrice(actionGasLimit: string): string | undefined {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        return undefined;
      }
      return (
        this.savingsOnChainService as SavingsOnChainService
      ).calculateTransactionNativePrice(
        gasPrice,
        actionGasLimit,
        this.ethPrice
      );
    },
    async checkSubsidizedAvailability(
      actionGasLimit: string
    ): Promise<boolean> {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        return false;
      }

      if (
        isBaseAsset(
          this.inputAsset?.address ?? 'missing_address',
          this.networkInfo?.network
        )
      ) {
        return false;
      }

      try {
        return await (
          this.savingsOnChainService as SavingsOnChainService
        ).isSubsidizedTransactionAllowed(
          gasPrice,
          actionGasLimit,
          this.ethPrice
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
    async handleTxReview(): Promise<void> {
      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await (
          this.savingsOnChainService as SavingsOnChainService
        ).estimateWithdrawCompound(this.inputAsset, this.inputAmountNative);

        this.actionGasLimit = gasLimits.actionGasLimit;

        if (!isZero(this.actionGasLimit)) {
          this.isSubsidizedEnabled = await this.checkSubsidizedAvailability(
            this.actionGasLimit
          );
          this.estimatedGasCost = this.subsidizedTxNativePrice(
            this.actionGasLimit
          );
        }

        this.step = 'review';
      } catch (error) {
        this.isSubsidizedEnabled = false;
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        console.warn('Failed to estimate transaction', error);
        Sentry.captureException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    handleSelectMaxAmount(): void {
      this.inputAmountNative = this.inputAsset.balance;
    },
    handleUpdateAmount(val: string): void {
      this.inputAmountNative = val;
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
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
        await (
          this.savingsOnChainService as SavingsOnChainService
        ).withdrawCompound(
          this.inputAsset,
          this.inputAmountNative,
          this.actionGasLimit,
          args.isSmartTreasury,
          async () => {
            this.transactionStep = 'Process';
          }
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        this.transactionStep = 'Reverted';
        console.error('Failed to withdraw', error);
        Sentry.captureException(error);
      }
    }
  }
});
</script>
