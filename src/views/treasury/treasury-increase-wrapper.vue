<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="
        $t('treasury.increaseBoost.txtIncreaseBoostPageDescription')
      "
      :header-title="$t('treasury.increaseBoost.lblIncreaseBoost')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('treasury.increaseBoost.lblWhatDoWeReserve')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="
        $t('treasury.increaseBoost.txtYouApproximateBoost')
      "
      :operation-title="newBoost"
      :output-asset-heading-text="
        $t('treasury.increaseBoost.lblAmountWeReserveIn')
      "
      :selected-token-description="description"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="
        $t('treasury.increaseBoost.btnIncreaseBoostInSmartTreasury')
      "
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('treasury.increaseBoost.lblReviewYourIncrease')"
      :image="treasury"
      :input-amount-native-title="$t('treasury.increaseBoost.lblAndTotalOf')"
      :input-amount-title="$t('treasury.increaseBoost.lblAmountWeDepositIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="inputAmountNative"
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

import { calcTreasuryBoost } from '@/store/modules/account/utils/treasury';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  isZero,
  multiply,
  sub
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { calcTransactionFastNativePrice } from '@/wallet/actions/subsidized';
import { depositCompound } from '@/wallet/actions/treasury/deposit/deposit';
import { estimateDepositCompound } from '@/wallet/actions/treasury/deposit/depositEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
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
  name: 'TreasuryIncreaseWrapper',
  components: {
    PrepareForm,
    ReviewForm,
    LoaderForm,
    SecondaryPage
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      //prepare-form
      inputMode: 'TOKEN' as InputMode,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '' as string,
      inputAmountNative: '' as string,
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,

      //current
      step: 'prepare' as ProcessStep,
      transactionStep: undefined as LoaderStep | undefined,
      treasury: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/SmartTreasury@1x.png'),
        sources: [
          { src: require('@/assets/images/SmartTreasury@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/SmartTreasury@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.webp')
          }
        ]
      } as PictureDescriptor,

      //to tx
      isSubsidizedEnabled: false,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapGetters('account', ['treasuryBoost']),
    ...mapState('account', [
      'networkInfo',
      'tokens',
      'treasuryBalanceMove',
      'treasuryBalanceLP',
      'currentAddress',
      'provider',
      'ethPrice',
      'gasPrices',
      'powercardState',
      'nativeCurrency'
    ]),
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
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    description(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return (
        sameAddress(this.inputAsset?.address, this.moveTokenInfo.address)
          ? this.$t('treasury.increaseBoost.txtYouChooseMove')
          : this.$t('treasury.increaseBoost.txtYouChooseMoveETHLp')
      ) as string;
    },
    newBoost(): string {
      if (this.inputAsset === undefined) {
        return `${formatToDecimals(this.treasuryBoost, 1)}x`;
      }

      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      let walletBalanceMove =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      let walletBalanceLP =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, slp.address)
        )?.balance ?? '0';

      let treasuryBalanceMove = this.treasuryBalanceMove;
      let treasuryBalanceLP = this.treasuryBalanceLP;

      if (sameAddress(this.inputAsset.address, move.address)) {
        let inputedAmount = this.inputAmount || '0';
        if (greaterThan(inputedAmount, walletBalanceMove)) {
          inputedAmount = walletBalanceMove;
        }
        walletBalanceMove = sub(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = add(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.inputAsset.address, slp.address)) {
        let inputedAmount = this.inputAmount || '0';
        if (greaterThan(inputedAmount, walletBalanceLP)) {
          inputedAmount = walletBalanceLP;
        }
        walletBalanceLP = sub(walletBalanceLP, inputedAmount);
        treasuryBalanceLP = add(treasuryBalanceLP, inputedAmount);
      }

      const futureBoost = calcTreasuryBoost(
        treasuryBalanceMove,
        treasuryBalanceLP,
        walletBalanceMove,
        walletBalanceLP,
        this.powercardState ?? 'NotStaked'
      );
      return `${formatToDecimals(futureBoost, 1)}x`;
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
          const move = newVal.find((t: TokenWithBalance) =>
            sameAddress(t.address, this.moveTokenInfo.address)
          );
          if (move) {
            this.inputAsset = move;
          }
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    handleBack(): void {
      if (this.step === 'review') {
        this.step = 'prepare';
      } else {
        this.$router.replace({
          name: 'treasury-manage'
        });
      }
    },
    async handleUpdateAmount(val: string): Promise<void> {
      await this.updateAmount(val, this.inputMode);
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
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
      } finally {
        this.isLoading = false;
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          treasuryOnly: true
        }
      });

      if (token === undefined) {
        return;
      }

      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.inputAmount = '';
      this.inputAmountNative = '';
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    handleSelectMaxAmount(): void {
      if (this.inputAsset === undefined) {
        return;
      }
      this.inputAmount = this.inputAsset.balance;
      this.inputAmountNative = multiply(
        this.inputAsset.balance,
        this.inputAsset.priceUSD
      );
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

      if (this.inputAsset?.address === 'eth') {
        console.info('Subsidizing for deposit ETH denied');
        return false;
      }

      // return isSubsidizedAllowed(
      //   gasPrice,
      //   actionGasLimit,
      //   this.ethPrice,
      //   this.treasuryBonusNative
      // );
      return false; // TODO: add treasury deposit subs
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateDepositCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        Sentry.captureException("can't estimate treasury deposit");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
    },
    async handleTxReview(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmount,
          this.inputAsset
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;

        console.info('Treasury deposit action gaslimit:', this.actionGasLimit);
        console.info(
          'Treasury deposit approve gaslimit:',
          this.approveGasLimit
        );

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
        this.isProcessing = false;
        console.error(`can't estimate treasury deposit for subs: ${err}`);
        Sentry.captureException("can't estimate treasury deposit for subs");
        return;
      }

      this.isProcessing = false;
      this.step = 'review';
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.inputAsset === undefined) {
        console.error('inputAsset is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      console.log('is smart treasury:', args.isSmartTreasury);

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await depositCompound(
          this.inputAsset,
          this.inputAmount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.approveGasLimit,
          async () => {
            this.transactionStep = 'Process';
          }
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (err) {
        this.transactionStep = 'Reverted';
        console.log('Treasury deposit txn reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
