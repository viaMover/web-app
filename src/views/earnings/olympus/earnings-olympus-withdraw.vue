<template>
  <secondary-page
    class="stake"
    :has-back-button="showBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="currentStep === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('earnings.olympus.txtWithdrawDescription')"
      :header-title="$t('earnings.olympus.lblWithdraw')"
      :input-amount="inputAmountNative"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('earnings.lblWhatDoWeWithdraw')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('earnings.txtIfYouKeepAsset')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('earnings.lblAmountWeWithdrawIn')"
      :selected-token-description="$t('earnings.olympus.txtOHMisNativeAsset')"
      :transfer-error="transferError"
      @review-tx="handleReviewTx"
      @select-max-amount="handleSelectMaxAmount"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="currentStep === 'review'"
      :amount="inputAmountNative"
      :button-text="
        $t('earnings.btnWithdraw', { symbol: this.inputAsset.symbol })
      "
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('earnings.lblReviewYourStake')"
      :image="withdraw"
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
import { mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { TransferData } from '@/services/v2/api/swap';
import { divide, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getOhmAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import {
  InputMode,
  LoaderForm,
  PrepareForm,
  ReviewForm
} from '@/components/forms';
import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

type processStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'EarningsOlympusWithdraw',
  components: {
    LoaderForm,
    ReviewForm,
    PrepareForm,
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
      withdraw: {
        alt: this.$t('earnings.olympus.txtWithdrawPictureAlt'),
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
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'NATIVE' as InputMode,
      inputAmountNative: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined,
      isSubsidizedEnabled: true
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      nativeCurrency: 'nativeCurrency',
      tokens: 'tokens',
      gasPrices: 'gasPrices',
      ethPrice: 'ethPrice'
    }),
    ...mapState('earnings/olympus', {
      olympusBalance: 'olympusBalance',
      olympusAPY: 'olympusAPY',
      ohmNativePrice: 'ohmNativePrice'
    }),
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    inputAsset(): TokenWithBalance {
      return {
        address: this.ohmAssetData.address,
        decimals: this.ohmAssetData.decimals,
        symbol: this.ohmAssetData.symbol,
        name: 'Olympus',
        priceUSD: this.ohmNativePrice,
        logo: this.ohmAssetData.iconURL,
        balance: this.olympusBalance,
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    ohmAssetData(): SmallTokenInfoWithIcon {
      return getOhmAssetData(this.networkInfo.network);
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

      const usdcNative = multiply(this.ohmNativePrice, this.ethPrice);
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      let apyNative = multiply(divide(this.olympusAPY, 100), usdcAmountNative);

      return `~ $${formatToNative(apyNative)}`;
    }
  },
  methods: {
    handleBack(): void {
      if (this.currentStep === 'review') {
        this.$router.back();
        return;
      }

      this.$router.replace({ name: 'earnings-olympus-manage' });
    },
    handleReviewTx(): void {
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
    handleSelectMaxAmount(): void {
      this.inputAmountNative = this.inputAsset.balance;
    },
    handleUpdateAmount(amount: string): void {
      this.inputAmountNative = amount;
    },
    handleCreateTx(args: { isSmartTreasury: boolean }): void {
      this.changeStep('loader');
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
    }
  }
});
</script>
