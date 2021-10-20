<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="
          $t('treasury.increaseBoost.txtIncreaseBoostPageDescription')
        "
        :title="$t('treasury.increaseBoost.lblIncreaseBoost')"
      />
      <div class="secondary_page-token-info">
        <span>{{ newBoost }}</span>
        <p>{{ $t('treasury.increaseBoost.txtYouApproximateBoost') }}</p>
      </div>
    </div>
    <div class="secondary_page-body">
      <h2>{{ $t('treasury.increaseBoost.lblWhatDoWeReserve') }}</h2>
      <div class="info">
        <token-image
          :address="asset ? asset.address : ''"
          :src="asset ? asset.logo : ''"
          :symbol="asset ? asset.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ asset ? asset.name : '' }}
            <span>
              {{ asset ? asset.symbol : '' }}
            </span>
          </p>
        </div>
        <button
          class="button-active button-arrow"
          :style="selectorStyle"
          type="button"
          @click.stop.prevent="handleOpenSelectModal"
        >
          <arrow-down-icon stroke="#fff" />
        </button>
      </div>
      <div class="available">
        <p>
          {{ $t('treasury.increaseBoost.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{ description }}
        </p>
      </div>
      <form autocomplete="off" class="form" @submit.prevent.stop="">
        <p>
          {{ $t('treasury.increaseBoost.lblAmountWeReserveIn') }}
          <span class="form-button" @click.capture.stop.prevent="swapTokens">
            {{ currentInputSymbo }}
          </span>
        </p>
        <dynamic-input
          :disabled="isLoading"
          input-class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          :symbol="currentInputSymbo"
          type="text"
          :value="inputValue"
          @update-value="handleUpdateValue"
        />
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img alt="pending" src="@/assets/images/ios-spinner-white.svg" />
          </div>
          <template v-else>
            {{ isButtonActive ? $t('treasury.lblReviewTransaction') : error }}
          </template>
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';
import { Properties as CssProperties } from 'csstype';

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
  notZero,
  sub
} from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { calcTransactionFastNativePrice } from '@/wallet/actions/subsidized';
import { estimateDepositCompound } from '@/wallet/actions/treasury/deposit/depositEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfo,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

type INPUT_MODE = 'NATIVE' | 'TOKEN';

export default Vue.extend({
  name: 'TreasuryIncreaseForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    ArrowDownIcon,
    DynamicInput
  },
  data() {
    return {
      selectedMode: 'TOKEN' as INPUT_MODE,
      asset: undefined as TokenWithBalance | undefined,
      maxInNative: '0' as string,
      amount: '',
      nativeAmount: '',
      isLoading: true,
      isProcessing: false,
      tokenSelectedByUser: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices',
      'tokens',
      'ethPrice',
      'usdcPriceInWeth',
      'ethPrice',
      'savingsBalance',
      'nativeCurrency',
      'treasuryBalanceMove',
      'treasuryBalanceLP'
    ]),
    ...mapGetters('account', ['treasuryBonusNative', 'getTokenColor']),
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    slpTokenInfo(): SmallTokenInfo {
      return getMoveWethLPAssetData(this.networkInfo.network);
    },
    description(): string {
      return (
        sameAddress(this.asset?.address, this.moveTokenInfo.address)
          ? this.$t('treasury.increaseBoost.txtYouChooseMove')
          : this.$t('treasury.increaseBoost.txtYouChooseMoveETHLp')
      ) as string;
    },
    currentInputSymbo(): string {
      if (this.selectedMode === 'TOKEN') {
        return this.asset?.symbol ?? '';
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    maxInputAmount(): string {
      if (this.asset === undefined) {
        return '0';
      }
      return this.asset.balance;
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      if (!notZero(this.amount)) {
        return this.$t('treasury.increaseBoost.lblChooseAmount') as string;
      }

      if (greaterThan(this.amount, this.maxInputAmount)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      return undefined;
    },
    inputValue(): string {
      return this.selectedMode === 'TOKEN' ? this.amount : this.nativeAmount;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
    },
    newBoost(): string {
      if (this.asset === undefined) {
        return '';
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

      if (sameAddress(this.asset.address, move.address)) {
        let inputedAmount = this.amount || '0';
        if (greaterThan(inputedAmount, walletBalanceMove)) {
          inputedAmount = walletBalanceMove;
        }
        walletBalanceMove = sub(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = add(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.asset.address, slp.address)) {
        let inputedAmount = this.amount || '0';
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
        walletBalanceLP
      );
      return `${formatToDecimals(futureBoost, 1)}x`;
    },
    formattedMaxAmount(): string {
      if (this.asset === undefined) {
        return `0`;
      }

      if (this.selectedMode === 'TOKEN') {
        return `${formatToDecimals(this.asset.balance, 4)} ${
          this.asset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.asset.balance, this.asset.priceUSD),
          2
        )} ${this.nativeCurrencySymbol}`;
      }
    },
    selectorStyle(): CssProperties {
      if (this.asset?.color === undefined) {
        return {
          backgroundColor: '#687EE3',
          boxShadow: '0 0 8px #687EE3'
        };
      }

      return {
        backgroundColor: this.asset.color,
        boxShadow: `0 0 8px ${this.asset.color}`
      };
    }
  },
  watch: {
    tokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (!this.tokenSelectedByUser) {
            const move = newVal.find((t: TokenWithBalance) =>
              sameAddress(t.address, this.moveTokenInfo.address)
            );
            if (move) {
              this.asset = move;
            }
          }
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    async handleUpdateValue(val: string): Promise<void> {
      await this.updatingValue(val, this.selectedMode);
    },
    async updatingValue(value: string, mode: INPUT_MODE): Promise<void> {
      if (this.asset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        if (mode === 'TOKEN') {
          this.amount = value;
          this.nativeAmount = convertNativeAmountFromAmount(
            value,
            this.asset.priceUSD
          );
        } else {
          this.amount = convertAmountFromNativeValue(
            value,
            this.asset.priceUSD,
            this.asset.decimals
          );
          this.nativeAmount = value;
        }
      } finally {
        this.isLoading = false;
      }
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

      if (this.asset?.address === 'eth') {
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
        console.error(resp.error);
        Sentry.captureException("can't estimate treasury deposit");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
    },
    async handleTxReview(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }

      let subsidizedEnabled = false;
      let subsidizedTxPrice = undefined;
      let actionGasLimit = '0';
      let approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(this.amount, this.asset);

        actionGasLimit = gasLimits.actionGasLimit;
        approveGasLimit = gasLimits.approveGasLimit;

        console.info('Treasury deposit action gaslimit:', actionGasLimit);
        console.info('Treasury deposit approve gaslimit:', approveGasLimit);

        if (!isZero(actionGasLimit)) {
          subsidizedEnabled = this.checkSubsidizedAvailability(actionGasLimit);
          subsidizedTxPrice = this.subsidizedTxNativePrice(actionGasLimit);
        }
      } catch (err) {
        subsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate treasury deposit for subs");
      } finally {
        this.isProcessing = false;
      }

      this.$emit('tx-review', {
        token: this.asset,
        amount: this.amount,
        nativeAmount: this.nativeAmount,
        subsidizedEnabled: subsidizedEnabled,
        estimatedGasCost: subsidizedTxPrice,
        actionGasLimit: actionGasLimit,
        approveGasLimit: approveGasLimit
      });
    },
    swapTokens(): void {
      if (this.selectedMode === 'TOKEN') {
        this.selectedMode = 'NATIVE';
      } else {
        this.selectedMode = 'TOKEN';
      }
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }
      if (this.selectedMode === 'TOKEN') {
        await this.updatingValue(this.asset.balance, 'TOKEN');
      } else {
        await this.updatingValue(
          new BigNumber(
            multiply(this.asset.balance, this.asset.priceUSD)
          ).toFixed(2, BigNumber.ROUND_DOWN),
          'NATIVE'
        );
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setIsModalDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          treasuryOnly: true
        }
      });

      if (token === undefined) {
        return;
      } else {
        this.tokenSelectedByUser = true;
        this.asset = token;
        this.amount = '';
        this.nativeAmount = '';
      }
    }
  }
});
</script>
