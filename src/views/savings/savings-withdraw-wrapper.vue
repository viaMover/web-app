<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
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
      :output-asset-heading-text="$t('savings.deposit.lblAmountWeDepositIn')"
      :selected-token-description="$t('savings.txtUSDCCoinIsAStable')"
      :transfer-error="transferError"
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

import { TransferData } from '@/services/0x/api';
import { divide, isZero, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { withdrawCompound } from '@/wallet/actions/savings/withdraw/withdraw';
import {
  CompoundEstimateResponse,
  estimateWithdrawCompound
} from '@/wallet/actions/savings/withdraw/withdrawEstimate';
import {
  calcTransactionFastNativePrice,
  isSubsidizedAllowed
} from '@/wallet/actions/subsidized';
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
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,

      //to tx
      isSubsidizedEnabled: false,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'savingsBalance',
      'usdcPriceInWeth',
      'savingsAPY',
      'provider',
      'ethPrice',
      'gasPrices',
      'nativeCurrency'
    ]),
    ...mapGetters('account', ['treasuryBonusNative', 'usdcNativePrice']),
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
    async estimateAction(
      amount: string,
      asset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateWithdrawCompound(
        asset,
        amount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        throw new Error("Can't estimate action");
      }
      return resp;
    },
    subsidizedTxNativePrice(actionGasLimit: string): string | undefined {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        console.log(
          "With empty parameter we can't calculate subsidized tx native price"
        );
        return undefined;
      }
      return calcTransactionFastNativePrice(
        gasPrice,
        actionGasLimit,
        this.ethPrice
      );
    },
    checkSubsidizedAvailability(actionGasLimit: string): boolean {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        console.log(
          "With empty parameter we don't allow subsidized transaction"
        );
        return false;
      }

      return isSubsidizedAllowed(
        gasPrice,
        actionGasLimit,
        this.ethPrice,
        this.treasuryBonusNative
      );
    },
    async handleTxReview(): Promise<void> {
      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmountNative,
          this.inputAsset
        );

        this.actionGasLimit = gasLimits.actionGasLimit;

        console.info('Savings withdraw action gaslimit:', this.actionGasLimit);

        if (!isZero(this.actionGasLimit)) {
          this.isSubsidizedEnabled = this.checkSubsidizedAvailability(
            this.actionGasLimit
          );
          this.estimatedGasCost = this.subsidizedTxNativePrice(
            this.actionGasLimit
          );
        }
      } catch (err) {
        this.isSubsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate savings deposit for subs");
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

      console.log('is smart treasury:', args.isSmartTreasury);

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await withdrawCompound(
          this.inputAsset,
          this.inputAmountNative,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          args.isSmartTreasury,
          async () => {
            this.transactionStep = 'Process';
          }
        );
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
