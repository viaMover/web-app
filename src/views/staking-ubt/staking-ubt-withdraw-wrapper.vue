<template>
  <secondary-page
    class="withdraw"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('stakingUBT.lblWithdraw')"
      :header-title="$t('stakingUBT.lblWithdrawFromSavings')"
      :input-amount="inputAmountNative"
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
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmountNative"
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

import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { captureException } from '@/services/v2/utils/sentry';
import { formatToNative } from '@/utils/format';
import { getUBTAssetData, getUSDCAssetData } from '@/wallet/references/data';
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
        src: require('@/assets/images/StakingUBT@1x.png'),
        sources: [
          {
            variant: '2x',
            src: require('@/assets/images/StakingUBT@2x.png')
          }
        ]
      } as PictureDescriptor,

      //prepare
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
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
      isLoadingUBTNativePrice: 'isLoadingUBTNativePrice',
      stakingOnChainService: 'onChainService',
      UBTBalance: 'contractUBTBalance'
    }),
    ...mapGetters('stakingUBT', {
      walletUBTBalance: 'walletUBTBalance',
      ubtNativePrice: 'ubtNativePrice'
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
        captureException(error);
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
        captureException(error);
      }
    }
  }
});
</script>
