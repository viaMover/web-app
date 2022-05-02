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
      :input-amount="inputAmount"
      :input-amount-native="inputAmount"
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
      :amount="inputAmount"
      :button-text="$t('savingsPlus.btn.withdrawFromSP')"
      :header-title="$t('savingsPlus.withdraw.lblReviewYourWithdraw')"
      :image="savings"
      :input-amount-native-title="$t('savingsPlus.withdraw.lblTotalAmountBack')"
      :input-amount-title="$t('savingsPlus.withdraw.lblAmountWeWithdrawIn')"
      :native-amount="formattedReceiveAmount"
      :token="inputAsset"
      @tx-start="handleTxStart"
    >
      <template v-slot:additional-items>
        <div v-if="isBridgingNeeded" class="item">
          <h2>{{ $t('savingsPlus.deposit.lblBridgingFee') }}</h2>
          <span> {{ bridgingFee }}</span>
        </div>
      </template>
      <!--<template v-slot:additional-items>
              <div class="item">
                <h2>
                  {{ $t('savingsPlus.withdraw.lblIncludingAccumulatedInterest') }}
                </h2>
                <span>{{ includingAccumulatedInterest }}</span>
              </div>
            </template>-->
    </review-form>
    <loader-form
      v-else-if="step === 'loader'"
      :additional-subtitle="successTxSubtitle"
      :step="transactionStep"
    >
      <template
        v-if="successTxSubtitle !== undefined"
        v-slot:additionalSubtitle
      >
        <div class="description">
          <span class="icon">👀</span>
          {{ successTxSubtitle }}
        </div>
      </template>
    </loader-form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import { BigNumber } from 'bignumber.js';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { TransferData } from '@/services/0x/api';
import {
  isWithdrawComplexTransactionData,
  MoverAPISavingsPlusService,
  WithdrawTransactionData
} from '@/services/v2/api/mover/savings-plus';
import {
  InvalidNetworkForOperationError,
  SavingsPlusOnChainService
} from '@/services/v2/on-chain/mover/savings-plus';
import {
  divide,
  fromWei,
  lessThanOrEqual,
  multiply,
  sub,
  toWei
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { getNetwork } from '@/utils/networkTypes';
import { getUSDCAssetData } from '@/wallet/references/data';
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
      inputAmount: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      withdrawTxData: undefined as WithdrawTransactionData | undefined,

      //to tx
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      provider: 'provider',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapState('savingsPlus', {
      APY: 'APY',
      savingsPlusOnChainService: 'onChainService',
      savingsPlusApiService: 'apiService'
    }),
    ...mapGetters('savingsPlus', {
      balance: 'infoBalanceUSDC'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    isBridgingNeeded(): boolean {
      return isWithdrawComplexTransactionData(this.withdrawTxData);
    },
    successTxSubtitle(): string | undefined {
      if (this.isBridgingNeeded && this.transactionStep === 'Success') {
        return this.$t('savingsPlus.lblTxAdditionalBridgeInfo') as string;
      }
      return undefined;
    },
    formattedReceiveAmount(): string {
      if (this.withdrawTxData === undefined) {
        return '0';
      }
      let receiveAmount = toWei(this.inputAmount, this.inputAsset.decimals);
      if (isWithdrawComplexTransactionData(this.withdrawTxData)) {
        receiveAmount = this.withdrawTxData.estimatedReceived;
      } else {
        receiveAmount = sub(receiveAmount, this.withdrawTxData.withdrawFee);
      }
      const receiveNativeAmount = multiply(
        fromWei(receiveAmount, this.inputAsset.decimals),
        this.usdcNativePrice
      );
      return `${formatToDecimals(
        receiveNativeAmount,
        2,
        BigNumber.ROUND_DOWN
      )} ${this.nativeCurrencySymbol}`;
    },
    inputAsset(): TokenWithBalance {
      const usdcAsset = getUSDCAssetData(this.networkInfo.network);
      return {
        address: usdcAsset.address,
        decimals: usdcAsset.decimals,
        symbol: usdcAsset.symbol,
        name: 'USD Coin',
        priceUSD: this.usdcNativePrice,
        logo: usdcAsset.iconURL,
        balance: this.balance,
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
    },
    bridgingFee(): string {
      if (isWithdrawComplexTransactionData(this.withdrawTxData)) {
        return `${formatToDecimals(
          fromWei(this.withdrawTxData.bridgeFee, this.inputAsset.decimals),
          4
        )} ${this.inputAsset.symbol}`;
      }
      return `0 ${this.inputAsset.symbol}`;
    }
  },
  methods: {
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn',
      switchEthereumChain: 'switchEthereumChain'
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
        this.withdrawTxData = await (
          this.savingsPlusApiService as MoverAPISavingsPlusService
        ).getWithdrawTransactionData(
          this.networkInfo.network,
          toWei(this.inputAmount, this.inputAsset.decimals)
        );

        let receiveAmount = toWei(this.inputAmount, this.inputAsset.decimals);
        if (isWithdrawComplexTransactionData(this.withdrawTxData)) {
          receiveAmount = this.withdrawTxData.estimatedReceived;
        } else {
          receiveAmount = sub(receiveAmount, this.withdrawTxData.withdrawFee);
        }

        console.log('receiveAmount', receiveAmount);

        if (lessThanOrEqual(receiveAmount, '0')) {
          sendGlobalTopMessageEvent(
            this.$t('savingsPlus.withdraw.lblNotEnough') as string,
            'error'
          );
          return;
        }

        const gasLimits = await (
          this.savingsPlusOnChainService as SavingsPlusOnChainService
        ).estimateWithdrawCompound(
          this.inputAsset,
          this.inputAmount,
          this.networkInfo.network,
          this.withdrawTxData
        );

        this.actionGasLimit = gasLimits.actionGasLimit;

        console.info(
          'Savings Plus withdraw action gaslimit:',
          this.actionGasLimit
        );
        this.step = 'review';
      } catch (error) {
        if (error instanceof InvalidNetworkForOperationError) {
          const networkInfo = getNetwork(error.getNetworkTo());
          if (networkInfo === undefined) {
            sendGlobalTopMessageEvent(
              this.$t('errors.default') as string,
              'error'
            );
            console.warn(
              'Empty target network while InvalidNetworkForOperationError',
              error
            );
            Sentry.captureException(error);
            return;
          }
          sendGlobalTopMessageEvent(
            this.$t('savingsPlus.errors.needChainSwitch', {
              network: networkInfo.name
            }) as string,
            'error'
          );
          return await this.switchEthereumChain(networkInfo);
        }

        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        console.warn(
          'Failed to estimate savings plus deposit transaction',
          error
        );
        Sentry.captureException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    handleSelectMaxAmount(): void {
      this.inputAmount = this.inputAsset.balance;
    },
    handleUpdateAmount(val: string): void {
      this.inputAmount = val;
    },
    async handleTxStart(): Promise<void> {
      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus withdraw TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings plus withdraw TX");
        return;
      }

      if (this.withdrawTxData === undefined) {
        console.error(
          'withdraw tx data is empty during `handleTxStart` when it is needed'
        );
        Sentry.captureException("can't start savings plus withdraw TX");
        return;
      }

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.savingsPlusOnChainService as SavingsPlusOnChainService
        ).withdrawCompound(
          this.inputAsset,
          this.inputAmount,
          this.networkInfo.network,
          async () => {
            this.transactionStep = 'Process';
          },
          this.withdrawTxData,
          this.actionGasLimit
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        if (error instanceof InvalidNetworkForOperationError) {
          const networkInfo = getNetwork(error.getNetworkTo());
          if (networkInfo === undefined) {
            sendGlobalTopMessageEvent(
              this.$t('errors.default') as string,
              'error'
            );
            console.warn(
              'Empty target network while InvalidNetworkForOperationError',
              error
            );
            Sentry.captureException(error);
            return;
          }
          sendGlobalTopMessageEvent(
            this.$t('savingsPlus.errors.needChainSwitch', {
              network: networkInfo.name
            }) as string,
            'error'
          );
          return await this.switchEthereumChain(networkInfo);
        }

        this.transactionStep = 'Reverted';
        console.log('Failed to withdraw', error);
        Sentry.captureException(error);
      }
    }
  }
});
</script>
