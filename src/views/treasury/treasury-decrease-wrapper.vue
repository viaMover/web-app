<template>
  <secondary-page
    class="decrease"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="
        $t('treasury.decreaseBoost.txtDecreaseBoostPageDescription')
      "
      :header-title="$t('treasury.decreaseBoost.lblDecreaseBoost')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('treasury.decreaseBoost.lblWhatDoWeRemove')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="
        $t('treasury.decreaseBoost.txtYouApproximateBoost')
      "
      :operation-title="newBoost"
      :output-asset-heading-text="
        $t('treasury.decreaseBoost.lblAmountWeRemoveIn')
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
        $t('treasury.decreaseBoost.btnDecreaseBoostInSmartTreasury')
      "
      :header-title="$t('treasury.decreaseBoost.lblReviewYourDecrease')"
      :image="treasury"
      :input-amount-native-title="$t('treasury.decreaseBoost.lblAndTotalOf')"
      :input-amount-title="$t('treasury.decreaseBoost.lblAmountWeRemoveIn')"
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
import { BigNumber } from 'bignumber.js';

import { CompoundEstimateResponse } from '@/services/v2/on-chain/mover';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  multiply,
  sub
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import {
  getAssetsForTreasury,
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfo,
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
  name: 'TreasuryDecreaseWrapper',
  components: {
    LoaderForm,
    PrepareForm,
    ReviewForm,
    SecondaryPage
  },
  mixins: [GasListenerMixin],
  data() {
    return {
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

      //prepare-form
      inputAmount: '',
      inputAmountNative: '',
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAsset: undefined as TokenWithBalance | undefined,

      //to tx
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapGetters('account', {
      moveNativePrice: 'moveNativePrice',
      slpNativePrice: 'slpNativePrice',
      treasuryBoost: 'treasuryBoost',
      currentNetworkWalletTokens: 'currentNetworkWalletTokens'
    }),
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress',
      provider: 'provider',
      gasPrices: 'gasPrices',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapState('treasury', {
      treasuryBalanceMove: 'treasuryBalanceMove',
      treasuryBalanceLP: 'treasuryBalanceLP',
      powercardState: 'powercardState',
      smartTreasuryOnChainService: 'onChainService'
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
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    slpTokenInfo(): SmallTokenInfo {
      return getMoveWethLPAssetData(this.networkInfo.network);
    },
    maxInputAmount(): string {
      if (this.inputAsset === undefined) {
        return '0';
      }
      return this.getTreasuryTokenBalance(this.inputAsset.address);
    },
    availableTokens(): Array<TokenWithBalance> {
      const treasuryTokens = getAssetsForTreasury(
        this.networkInfo.network,
        this.moveNativePrice,
        this.slpNativePrice
      );
      return treasuryTokens
        .map((t) => ({
          ...t,
          balance: this.getTreasuryTokenBalance(t.address)
        }))
        .filter((t) => greaterThan(t.balance, '0'));
    },
    description(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return (
        sameAddress(this.inputAsset?.address, this.moveTokenInfo.address)
          ? this.$t('treasury.decreaseBoost.txtYouChooseMove')
          : this.$t('treasury.decreaseBoost.txtYouChooseMoveETHLp')
      ) as string;
    },
    newBoost(): string {
      if (this.inputAsset === undefined) {
        return `${formatToDecimals(this.treasuryBoost, 1)}x`;
      }

      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      let walletBalanceMove =
        this.currentNetworkWalletTokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      let walletBalanceLP =
        this.currentNetworkWalletTokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, slp.address)
        )?.balance ?? '0';

      let treasuryBalanceMove = this.treasuryBalanceMove;
      let treasuryBalanceLP = this.treasuryBalanceLP;

      if (sameAddress(this.inputAsset.address, move.address)) {
        let inputedAmount = this.inputAmount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceMove)) {
          inputedAmount = treasuryBalanceMove;
        }
        walletBalanceMove = add(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = sub(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.inputAsset.address, slp.address)) {
        let inputedAmount = this.inputAmount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceLP)) {
          inputedAmount = treasuryBalanceLP;
        }
        walletBalanceLP = add(walletBalanceLP, inputedAmount);
        treasuryBalanceLP = sub(treasuryBalanceLP, inputedAmount);
      }

      const futureBoost = (
        this.smartTreasuryOnChainService as SmartTreasuryOnChainService
      ).calculateTreasuryBoost(
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
    availableTokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (this.isTokenSelectedByUser) {
            return;
          }
          const move = newVal.find((t: TokenWithBalance) =>
            sameAddress(
              t.address,
              getMoveAssetData(this.networkInfo.network).address
            )
          );
          if (move !== undefined) {
            this.inputAsset = move;
          } else {
            if (newVal.length > 0) {
              this.inputAsset = newVal[0];
            } else {
              this.inputAsset = undefined;
            }
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
    getTreasuryTokenBalance(address: string): string {
      if (sameAddress(address, this.moveTokenInfo.address)) {
        return this.treasuryBalanceMove;
      }
      if (sameAddress(address, this.slpTokenInfo.address)) {
        return this.treasuryBalanceLP;
      }
      return '0';
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await (
        this.smartTreasuryOnChainService as SmartTreasuryOnChainService
      ).estimateWithdrawCompound(inputAsset, inputAmount);
      if (resp.error) {
        throw new Error("Can't estimate action");
      }
      return resp;
    },
    async handleTxReview(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmount,
          this.inputAsset
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;
      } catch (error) {
        this.isProcessing = false;
        console.warn('Failed to estimate withdraw', error);
        Sentry.captureException(error);
        return;
      }

      this.isProcessing = false;
      this.step = 'review';
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
          forceTokenArray: this.availableTokens
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
    async handleSelectMaxAmount(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }
      if (this.inputMode === 'TOKEN') {
        await this.updateAmount(this.maxInputAmount, 'TOKEN');
      } else {
        await this.updateAmount(
          new BigNumber(
            multiply(this.maxInputAmount, this.inputAsset.priceUSD)
          ).toFixed(2, BigNumber.ROUND_DOWN),
          'NATIVE'
        );
      }
    },
    async handleTxStart(): Promise<void> {
      if (this.inputAsset === undefined) {
        console.error('inputAsset is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.inputAmount === '') {
        console.error('amount is empty during `handleTxStart`');
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

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).withdrawCompound(
          this.inputAsset,
          this.inputAmount,
          this.actionGasLimit,
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
