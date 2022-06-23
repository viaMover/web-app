<template>
  <secondary-page
    class="deposit"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <form
      v-if="step === 'prepare'"
      class="form"
      @submit.prevent="handleTxReview"
    >
      <secondary-page-header :title="$t('depositInSavings')" />

      <token-selector
        class="mb-16"
        :current-asset="inputAsset"
        input-id="input-asset"
        :label-text="$t('whatDoWeDeposit')"
        @select="handleOpenSelectModal"
      >
        {{
          isSwapNeeded ? $t('savingsNonNativeAsset') : $t('savingsNativeAsset')
        }}
      </token-selector>

      <form-use-all
        v-if="inputAsset"
        v-model="useAllBalance"
        :input-mode="inputMode"
        :token="inputAsset"
      >
        {{ $t('depositAll') }}
      </form-use-all>

      <amount-field
        :amount="inputValue"
        :asset-symbol="currentInputSymbol"
        class="mb-40"
        input-id="input-amount"
        @input="handleUpdateAmount"
        @mode-changed="handleToggleInputMode"
      >
        <template #label>
          {{ $t('amountWeDepositIn') }}
          <span class="selector button-like" @click="handleToggleInputMode">
            {{ currentInputSymbol }}
          </span>
        </template>
        <template #description>
          <form-swap-message
            v-if="showSwapMessage"
            :amount="formattedUSDCTotal"
            :target-token="outputAsset"
          />
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
      <secondary-page-header :title="$t('reviewYourDeposit')" />

      <form-direction-pair :left="inputAsset" :right="savingsPicture" />

      <div class="form-section">
        <review-statement
          :description="
            formatAsCryptoWithSymbol(
              inputAmount,
              inputAsset.symbol,
              inputAsset.decimals
            )
          "
        >
          <template #title>
            {{ $t('amountWeDepositIn') }} {{ inputAsset.symbol }}
          </template>
        </review-statement>

        <review-statement
          :description="formattedUSDCTotal"
          :title="$t('totalDepositedIntoSavings')"
        />

        <review-statement
          :description="balanceAfterDeposit"
          :title="$t('savingsBalanceAfterDeposit')"
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

      <submit-button
        :disabled="transferError !== undefined"
        :error="transferError"
        :loading="isLoading || isProcessing"
      >
        {{ $t('depositInSavings') }}
      </submit-button>
    </form>
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
    <search-token-modal />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import savingsPicture from '@/assets/images/sections/savings';
import { MoverError } from '@/services/v2';
import { TransferData, ZeroXAPIService } from '@/services/v2/api/0x';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { captureSentryException } from '@/services/v2/utils/sentry';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { isBaseAsset, sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  fromWei,
  greaterThan,
  isZero,
  notZero,
  toWei
} from '@/utils/bigmath';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { getSlippage } from '@/wallet/references/data';
import { Token, TokenWithBalance } from '@/wallet/types';

import { InputMode, LoaderStep } from '@/components/forms';
import AmountField from '@/components/v1.2/form-controls/amount-field.vue';
import FormDirectionPair from '@/components/v1.2/form-controls/form-direction-pair.vue';
import FormSwapMessage from '@/components/v1.2/form-controls/form-swap-message.vue';
import FormUseAll from '@/components/v1.2/form-controls/form-use-all.vue';
import LoaderForm from '@/components/v1.2/form-controls/loader-form/loader-form.vue';
import SubmitButton from '@/components/v1.2/form-controls/submit-button.vue';
import CustomSwitch from '@/components/v1.2/form-controls/switch-field.vue';
import TokenSelector from '@/components/v1.2/form-controls/token-selector.vue';
import SecondaryPage from '@/components/v1.2/layout/secondary-page.vue';
import SecondaryPageHeader from '@/components/v1.2/layout/secondary-page-header.vue';
import SearchTokenModal from '@/components/v1.2/modal/search-token-modal/search-token-modal.vue';
import ReviewStatement from '@/components/v1.2/review-statement.vue';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  components: {
    FormUseAll,
    ReviewStatement,
    SubmitButton,
    FormDirectionPair,
    SecondaryPage,
    SecondaryPageHeader,
    SearchTokenModal,
    AmountField,
    CustomSwitch,
    TokenSelector,
    LoaderForm,
    FormSwapMessage
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      step: 'prepare' as ProcessStep,
      transactionStep: 'Process' as LoaderStep | undefined,
      savingsPicture,

      //prepare
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '0',
      inputAmountNative: '0',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      useAllBalance: false,
      isSubsidizedEnabled: false,
      useSmartTreasury: true,

      //to tx
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      nativeCurrency: 'nativeCurrency',
      gasPrices: 'gasPrices',
      ethPrice: 'ethPrice',
      tokens: 'tokens',
      swapService: 'swapAPIService'
    }),
    ...mapState('savings', {
      savingsOnChainService: 'onChainService'
    }),
    ...mapGetters('savings', {
      usdcTokenInfo: 'usdcTokenInfo'
    }),
    usdcWalletBalance(): string {
      return this.usdcTokenInfo.balance;
    },
    inputValue(): string {
      return this.inputMode === 'TOKEN'
        ? this.inputAmount
        : this.inputAmountNative;
    },
    currentInputSymbol(): string {
      if (this.inputMode === 'TOKEN') {
        return this.inputAsset?.symbol ?? '';
      } else {
        return this.nativeCurrency.toUpperCase();
      }
    },
    outputAsset(): Token {
      return this.usdcTokenInfo as Token;
    },
    isSwapNeeded(): boolean {
      return (
        this.inputAsset === undefined ||
        !sameAddress(this.inputAsset.address, this.outputAsset.address)
      );
    },
    hasBackButton(): boolean {
      return this.step === 'review';
    },
    usdcTotal(): string {
      if (this.inputAsset === undefined || this.transferData === undefined) {
        return '0';
      }

      return fromWei(this.transferData.buyAmount, this.outputAsset.decimals);
    },
    showSwapMessage(): boolean {
      return (
        this.isSwapNeeded &&
        this.inputMode === 'TOKEN' &&
        notZero(this.usdcTotal)
      );
    },
    formattedUSDCTotal(): string {
      return this.formatAsCryptoWithSymbol(
        this.usdcTotal,
        this.outputAsset.symbol
      );
    },
    balanceAfterDeposit(): string {
      if (this.isSwapNeeded && this.transferData !== undefined) {
        const boughtUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputAsset.decimals
        );

        return this.formatAsCryptoWithSymbol(
          add(this.usdcWalletBalance, boughtUSDC),
          this.outputAsset.symbol
        );
      }

      return this.formatAsCryptoWithSymbol(
        add(this.usdcWalletBalance, this.inputAmountNative),
        this.outputAsset.symbol
      );
    },
    error(): string | undefined {
      if (this.inputAsset === undefined) {
        return this.$t('chooseToken') as string;
      }
      if (!notZero(this.inputAmount)) {
        return this.$t('chooseAmount') as string;
      }
      if (greaterThan(this.inputAmount, this.inputAsset?.balance ?? 0)) {
        return this.$t('insufficientBalance') as string;
      }
      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    }
  },
  watch: {
    tokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (this.isTokenSelectedByUser) {
            return;
          }
          const baseAsset = newVal.find((t: TokenWithBalance) =>
            isBaseAsset(t.address, this.currentNetwork)
          );
          if (baseAsset) {
            this.inputAsset = baseAsset;
          }
        } finally {
          this.isLoading = false;
        }
      }
    },
    useAllBalance(newValue: boolean) {
      if (!newValue) {
        return;
      }

      this.handleSelectMaxAmount();
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
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
      if (this.inputAsset === undefined || this.error !== undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const estimation = await (
          this.savingsOnChainService as SavingsOnChainService
        ).estimateDepositCompound(
          this.inputAsset,
          this.outputAsset,
          this.inputAmount,
          this.transferData
        );

        this.actionGasLimit = estimation.actionGasLimit;
        this.approveGasLimit = estimation.approveGasLimit;

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
        captureSentryException(error);
        this.transferError = this.$t('estimationError') as string;
        this.isSubsidizedEnabled = false;
      } finally {
        this.isProcessing = false;
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
        ).isSubsidizedTransactionAllowed(gasPrice, actionGasLimit, ethPrice);
      } catch (error) {
        captureSentryException(error);
        return false;
      }
    },
    async handleUpdateAmount(val: string): Promise<void> {
      this.useAllBalance = false;
      await this.updateAmount(val, this.inputMode);
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        if (!this.isSwapNeeded) {
          this.transferData = undefined;
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = convertNativeAmountFromAmount(
              value,
              this.inputAsset.priceUSD
            );
          } else {
            this.inputAmount = convertAmountFromNativeValue(
              value,
              this.inputAsset.priceUSD,
              this.inputAsset.decimals
            );
            this.inputAmountNative = value;
          }
        } else {
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = convertNativeAmountFromAmount(
              value,
              this.inputAsset.priceUSD
            );
            const inputInWei = toWei(value, this.inputAsset.decimals);
            this.transferData = await (
              this.swapService as ZeroXAPIService
            ).getTransferData(
              this.outputAsset.address,
              this.inputAsset.address,
              inputInWei,
              true,
              getSlippage(this.inputAsset.address, this.currentNetwork)
            );
            this.transferError = undefined;
          } else {
            this.inputAmountNative = value;
            const inputInWei = toWei(
              convertAmountFromNativeValue(
                value,
                this.inputAsset.priceUSD,
                this.inputAsset.decimals
              ),
              this.inputAsset.decimals
            );
            this.transferData = await (
              this.swapService as ZeroXAPIService
            ).getTransferData(
              this.outputAsset.address,
              this.inputAsset.address,
              inputInWei,
              true,
              getSlippage(this.inputAsset.address, this.currentNetwork)
            );
            this.transferError = undefined;
            this.inputAmount = fromWei(
              this.transferData.sellAmount,
              this.inputAsset.decimals
            );
          }
        }
      } catch (error) {
        if (error instanceof MoverError) {
          this.transferError = (
            this.swapService as ZeroXAPIService
          ).mapErrorMessage(error.message, this.$i18n);
        } else {
          this.transferError = this.$t('exchangeError') as string;
        }

        captureSentryException(error);
        this.transferData = undefined;
        if (mode === 'TOKEN') {
          this.inputAmountNative = '0';
        } else {
          this.inputAmount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true
        }
      });

      if (token === undefined) {
        return;
      }
      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.transferData = undefined;
      this.transferError = undefined;
      this.inputAmount = '0';
      this.inputAmountNative = '0';
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      await this.updateAmount(this.inputAsset.balance, 'TOKEN');
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.error !== undefined) {
        return;
      }

      if (this.inputAsset === undefined) {
        captureSentryException('inputAsset is empty during `handleTxStart`');
        return;
      }

      if (this.inputAmount === '') {
        captureSentryException('inputAmount is empty during `handleTxStart`');
        return;
      }

      if (this.actionGasLimit === undefined) {
        captureSentryException(
          'action gas limit is empty during `handleTxStart`'
        );
        return;
      }

      if (this.approveGasLimit === undefined) {
        captureSentryException(
          'approve gas limit is empty during `handleTxStart`'
        );
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.savingsOnChainService as SavingsOnChainService
        ).depositCompound(
          this.inputAsset,
          this.outputAsset,
          this.inputAmount,
          this.transferData,
          args.isSmartTreasury,
          this.actionGasLimit,
          this.approveGasLimit
          // fixme: add event bus
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
