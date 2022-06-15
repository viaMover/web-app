<template>
  <secondary-page
    class="withdraw"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <form
      v-if="step === 'prepare'"
      class="form"
      @submit.prevent="handleTxReview"
    >
      <secondary-page-header :title="$t('withdrawFromSavings')" />

      <token-selector
        class="mb-16"
        :current-asset="asset"
        input-id="asset"
        :label-text="$t('whatDoWeWithdraw')"
      >
        {{ $t('savingsWithdrawNativeAsset') }}
      </token-selector>

      <form-use-all
        v-model="useAllBalance"
        :input-mode="inputMode"
        :token="asset"
      >
        {{ $t('withdrawAll') }}
      </form-use-all>

      <amount-field
        :amount="inputValue"
        :asset-balance="asset.balance"
        :asset-symbol="currentSymbol"
        class="mb-40"
        input-id="amount"
        @input="handleUpdateAmount"
        @mode-changed="handleToggleInputMode"
      >
        <template #label>
          {{ $t('amountWeWithdrawIn') }}
          <span class="selector button-like" @click="handleToggleInputMode">
            {{ currentSymbol }}
          </span>
        </template>
      </amount-field>

      <submit-button
        :disabled="error !== undefined"
        :error="error"
        :loading="isLoading || isProcessing"
      >
        {{ $t('reviewTransaction') }}
      </submit-button>
    </form>
    <form
      v-else-if="step === 'review'"
      class="form"
      @submit.prevent="handleTxStart"
    >
      <secondary-page-header :title="$t('reviewYourWithdrawal')" />

      <form-direction-pair :left="savingsPicture" :right="asset" />

      <div class="form-section">
        <review-statement
          :description="
            formatAsCryptoWithSymbol(amount, asset.symbol, asset.decimals)
          "
        >
          <template #title>
            {{ $t('amountWeWithdrawIn') }} {{ asset.symbol }}
          </template>
        </review-statement>

        <review-statement
          :description="totalInterestCollected"
          :title="$t('totalInterestCollected')"
        />

        <review-statement
          :description="balanceAfterWithdrawal"
          :title="$t('savingsBalanceAfterWithdrawal')"
        />

        <template v-if="isSubsidizedEnabled">
          <custom-switch v-model="useSmartTreasury" class="review-statement">
            {{ $t('useSmartTreasury') }}
          </custom-switch>

          <review-statement
            :description="formatAsNativeCurrency(estimatedGasCost)"
            :title="$t('estimatedGasCost')"
          />
        </template>
      </div>

      <submit-button :loading="isLoading || isProcessing">
        {{ $t('withdrawFromSavings') }}
      </submit-button>
    </form>
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import savingsPicture from '@/assets/images/sections/savings';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { captureSentryException } from '@/services/v2/utils/sentry';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  isZero,
  notZero,
  sub
} from '@/utils/bigmath';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { TokenWithBalance } from '@/wallet/types';

import CustomSwitch from '@/components/controls/custom-switch.vue';
import { SecondaryPage } from '@/components/layout/secondary-page';
import AmountField from '@/components/v1.2/form-controls/amount-field.vue';
import FormDirectionPair from '@/components/v1.2/form-controls/form-direction-pair.vue';
import FormUseAll from '@/components/v1.2/form-controls/form-use-all.vue';
import LoaderForm from '@/components/v1.2/form-controls/loader-form/loader-form.vue';
import { LoaderStep } from '@/components/v1.2/form-controls/loader-form/types';
import SubmitButton from '@/components/v1.2/form-controls/submit-button.vue';
import TokenSelector from '@/components/v1.2/form-controls/token-selector.vue';
import { InputMode } from '@/components/v1.2/form-controls/types';
import SecondaryPageHeader from '@/components/v1.2/layout/secondary-page-header.vue';
import ReviewStatement from '@/components/v1.2/review-statement.vue';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  components: {
    LoaderForm,
    SecondaryPage,
    SecondaryPageHeader,
    FormUseAll,
    SubmitButton,
    CustomSwitch,
    ReviewStatement,
    TokenSelector,
    FormDirectionPair,
    AmountField
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      savingsPicture,
      //current
      step: 'prepare' as ProcessStep,
      transactionStep: undefined as LoaderStep | undefined,

      //prepare
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      useAllBalance: false,
      amount: '0',
      amountNative: '0',
      isSubsidizedEnabled: false,
      useSmartTreasury: true,

      //to tx
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      nativeCurrency: 'nativeCurrency',
      gasPrices: 'gasPrices',
      ethPrice: 'ethPrice'
    }),
    ...mapState('savings', {
      savingsOnChainService: 'onChainService'
    }),
    ...mapGetters('savings', {
      balanceOnContract: 'savingsInfoBalanceUSDC',
      usdcTokenInfo: 'usdcTokenInfo'
    }),
    inputValue(): string {
      return this.inputMode === 'TOKEN' ? this.amount : this.amountNative;
    },
    currentSymbol(): string {
      if (this.inputMode === 'TOKEN') {
        return this.usdcTokenInfo?.symbol ?? '';
      } else {
        return this.nativeCurrency.toUpperCase();
      }
    },
    asset(): TokenWithBalance {
      return {
        ...this.usdcTokenInfo,
        balance: this.balanceOnContract
      };
    },
    hasBackButton(): boolean {
      return this.step === 'review';
    },
    totalInterestCollected(): string {
      // TODO: missing data to display this
      return this.formatAsCryptoWithSymbol(-1, this.asset.symbol);
    },
    balanceAfterWithdrawal(): string {
      return this.formatAsCryptoWithSymbol(
        sub(this.balanceOnContract, this.amount),
        this.asset.symbol
      );
    },
    error(): string | undefined {
      if (!notZero(this.amount)) {
        return this.$t('chooseAmount') as string;
      }
      if (greaterThan(this.amount, this.balanceOnContract)) {
        return this.$t('insufficientBalance') as string;
      }

      return undefined;
    }
  },
  watch: {
    useAllBalance(newValue: boolean) {
      if (!newValue) {
        return;
      }

      this.handleSelectMaxAmount();
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
        ).estimateWithdrawCompound(this.asset, this.amount);

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
        captureSentryException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    handleSelectMaxAmount(): void {
      this.updateAmount(this.balanceOnContract, 'TOKEN');
    },
    handleUpdateAmount(val: string): void {
      this.useAllBalance = false;
      this.updateAmount(val, this.inputMode);
    },
    updateAmount(val: string, mode: string): void {
      if (this.isLoading) {
        return;
      }

      if (mode === 'TOKEN') {
        this.amount = val;
        this.amountNative = convertNativeAmountFromAmount(
          val,
          this.asset.priceUSD
        );
      } else {
        this.amount = convertAmountFromNativeValue(
          val,
          this.asset.priceUSD,
          this.asset.decimals
        );
        this.amountNative = val;
      }
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.error !== undefined) {
        return;
      }

      if (this.actionGasLimit === undefined) {
        captureSentryException('empty action gas limit');
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.savingsOnChainService as SavingsOnChainService
        ).withdrawCompound(
          this.asset,
          this.amount,
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
        captureSentryException(error);
      }
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    }
  }
});
</script>
