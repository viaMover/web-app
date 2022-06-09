<template>
  <secondary-page
    class="deposit"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      :header-description="$t('stakingUBT.txtDepositDescription')"
      :header-title="$t('stakingUBT.lblDeposit')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('stakingUBT.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('stakingUBT.txtEarnEstimation')"
      :operation-title="estimatedAnnualEarning"
      :output-asset-heading-text="$t('stakingUBT.lblAmountWeDepositIn')"
      :transfer-error="complexError"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('stakingUBT.btnDepositInStaking')"
      :header-title="$t('stakingUBT.lblReviewYourDeposit')"
      :image="depositUbtPicture"
      :input-amount-native-title="$t('stakingUBT.lblAndTotalOf')"
      :input-amount-title="$t('stakingUBT.lblAmountWeDepositIn')"
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

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { captureSentryException } from '@/services/v2/utils/sentry';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  greaterThan,
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
  name: 'StakingUbtDepositWrapper',
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
      depositUbtPicture: {
        src: require('@/assets/images/staking-ubt/Staking_General.png'),
        sources: [
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_General@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/staking-ubt/Staking_General.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_General@2x.webp')
          }
        ]
      } as PictureDescriptor,

      //prepare
      isProcessing: false,
      inputMode: 'TOKEN' as InputMode,
      inputAmount: '',
      inputAmountNative: '',
      error: undefined as string | undefined,

      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
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
      apy: 'apy',
      isLoadingUBTNativePrice: 'isLoadingUBTNativePrice',
      stakingOnChainService: 'onChainService'
    }),
    ...mapGetters('stakingUBT', {
      walletBalance: 'walletBalance',
      ubtNativePrice: 'ubtNativePrice',
      balance: 'balance'
    }),
    complexError(): string | undefined {
      if (!greaterThan(this.walletBalance, '0')) {
        return this.$t('stakingUBT.lblNoUBTTokens') as string;
      }

      return this.error;
    },
    isLoading(): boolean {
      return this.isLoadingUBTNativePrice || !this.isTokensListLoaded;
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    estimatedAnnualEarning(): string {
      let possibleStakingBalance = '0';

      if (greaterThan(this.inputAmount, '0')) {
        possibleStakingBalance = this.inputAmount;
      }
      if (this.balance !== undefined) {
        possibleStakingBalance = add(this.balance, possibleStakingBalance);
      }

      const apyNative = multiply(
        divide(this.apy, 100),
        multiply(possibleStakingBalance, this.ubtNativePrice)
      );

      return `~ $${formatToNative(apyNative)}`;
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
        balance: this.walletBalance,
        marketCap: Number.MAX_SAFE_INTEGER,
        color: this.getTokenColor(data.address)
      };
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
      try {
        this.actionGasLimit = '0';
        this.approveGasLimit = '0';
        this.isProcessing = true;
        const gasLimits = await (
          this.stakingOnChainService as StakingUbtOnChainService
        ).estimateDepositCompound(this.inputAsset, this.inputAmount);

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;
        this.step = 'review';
      } catch (error) {
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        captureSentryException(error);
      } finally {
        this.isProcessing = false;
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
    async handleTxStart(): Promise<void> {
      if (
        this.actionGasLimit === undefined ||
        this.inputAmount === '' ||
        this.approveGasLimit === undefined
      ) {
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.stakingOnChainService as StakingUbtOnChainService
        ).depositCompound(
          this.inputAsset,
          this.inputAmount,
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
        captureSentryException(error);
      }
    }
  }
});
</script>
