<template>
  <secondary-page
    class="withdraw"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('stakingUBT.txtWithdraw')"
      :header-title="$t('stakingUBT.lblWithdraw')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('stakingUBT.lblWhatDoWeWithdraw')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('stakingUBT.txtKeepEstimation')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('stakingUBT.lblAmountWeWithdrawIn')"
      :transfer-error="error"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('stakingUBT.btnWithdrawFromStaking')"
      :header-title="$t('stakingUBT.lblReviewYourWithdraw')"
      :image="withdrawUbtPicture"
      :input-amount-native-title="$t('stakingUBT.lblAndTotalOf')"
      :input-amount-title="$t('stakingUBT.lblAmountWeWithdrawIn')"
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

import BigNumber from 'bignumber.js';

import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { captureSentryException } from '@/services/v2/utils/sentry';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  multiply
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getUBTAssetData } from '@/wallet/references/data';
import { TokenWithBalance } from '@/wallet/types';

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
  name: 'StakingUbtWithdrawWrapper',
  components: {
    ReviewForm,
    PrepareForm,
    LoaderForm,
    SecondaryPage
  },
  data() {
    return {
      //current
      step: 'prepare' as ProcessStep,
      transactionStep: undefined as LoaderStep | undefined,
      withdrawUbtPicture: {
        src: require('@/assets/images/staking-ubt/Staking_Withdraw.png'),
        sources: [
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_Withdraw@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/staking-ubt/Staking_Withdraw.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_Withdraw@2x.webp')
          }
        ]
      } as PictureDescriptor,

      //prepare
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAmount: '',
      inputAmountNative: '',
      error: undefined as string | undefined,

      //to tx
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      nativeCurrency: 'nativeCurrency',
      isTokensListLoaded: 'isTokensListLoaded'
    }),
    ...mapGetters('account', {
      getTokenColor: 'getTokenColor'
    }),
    ...mapState('stakingUBT', {
      stakingOnChainService: 'onChainService'
    }),
    ...mapGetters('stakingUBT', {
      ubtNativePrice: 'ubtNativePrice',
      UBTBalance: 'balance'
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
    inputAsset(): TokenWithBalance {
      const data = getUBTAssetData(this.networkInfo.network);

      return {
        address: data.address,
        decimals: data.decimals,
        symbol: data.symbol,
        name: data.name,
        priceUSD: this.ubtNativePrice,
        logo: data.iconURL,
        balance: this.UBTBalance,
        marketCap: Number.MAX_SAFE_INTEGER,
        color: this.getTokenColor(data.address)
      };
    },
    estimatedAnnualEarnings(): string {
      return '-';
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
    handleUpdateAmount(val: string): void {
      this.error = undefined;
      this.updateAmount(val, this.inputMode);
    },
    updateAmount(value: string, mode: InputMode): void {
      if (mode === 'TOKEN') {
        this.inputAmount = value;
        this.inputAmountNative = convertNativeAmountFromAmount(
          value,
          this.inputAsset.priceUSD
        );
        return;
      }

      this.inputAmount = convertAmountFromNativeValue(
        value,
        this.inputAsset.priceUSD,
        this.inputAsset.decimals
      );
      this.inputAmountNative = value;
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    async handleSelectMaxAmount(): Promise<void> {
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
    async handleTxReview(): Promise<void> {
      this.actionGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await (
          this.stakingOnChainService as StakingUbtOnChainService
        ).estimateWithdrawCompound(this.inputAsset, this.inputAmountNative);

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.step = 'review';
      } catch (error) {
        this.error = this.$t('estimationError') as string;
        captureSentryException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    async handleTxStart(): Promise<void> {
      if (this.inputAmountNative === '' || this.actionGasLimit === undefined) {
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.stakingOnChainService as StakingUbtOnChainService
        ).withdrawCompound(
          this.inputAsset,
          this.inputAmountNative,
          async () => {
            this.transactionStep = 'Process';
          },
          this.actionGasLimit
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        this.transactionStep = 'Reverted';
        captureSentryException(error);
      }
    }
  }
});
</script>
