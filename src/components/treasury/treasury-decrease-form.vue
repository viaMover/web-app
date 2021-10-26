<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="
          $t('treasury.decreaseBoost.txtDecreaseBoostPageDescription')
        "
        :title="$t('treasury.decreaseBoost.lblDecreaseBoost')"
      />
      <div class="secondary_page-token-info">
        <span>{{ newBoost }}</span>
        <p>{{ $t('treasury.decreaseBoost.txtYouApproximateBoost') }}</p>
      </div>
    </div>
    <div class="secondary_page-body">
      <h2>{{ $t('treasury.decreaseBoost.lblWhatDoWeRemove') }}</h2>
      <div class="info">
        <token-image
          :address="asset ? asset.address : ''"
          :src="asset ? asset.logo : ''"
          :symbol="asset ? asset.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ asset ? asset.name : $t('treasury.lblChooseToken') }}
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
          <arrow-down-icon :stroke="asset ? '#fff' : '#000'" />
        </button>
      </div>
      <div class="available">
        <p>
          {{ $t('treasury.decreaseBoost.lblAvailable') }}
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
          {{ $t('treasury.decreaseBoost.lblAmountWeRemoveIn') }}
          <span class="form-button" @click.capture.stop.prevent="swapTokens">
            {{ currentInputSymbol }}
          </span>
        </p>
        <dynamic-input
          :disabled="isLoading"
          input-class="deposit__form-input eth-input"
          placeholder="0.00"
          :symbol="currentInputSymbol"
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
            <img
              :alt="$t('icon.txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
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
  multiply,
  notZero,
  sub
} from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { estimateWithdrawCompound } from '@/wallet/actions/treasury/withdraw/withdrawEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
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

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

type INPUT_MODE = 'NATIVE' | 'TOKEN';

export default Vue.extend({
  name: 'TreasuryDecreaseForm',
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
      amount: '',
      nativeAmount: '',
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'tokens',
      'nativeCurrency',
      'treasuryBalanceMove',
      'treasuryBalanceLP',
      'powercardState'
    ]),
    ...mapGetters('account', [
      'getTokenColor',
      'moveNativePrice',
      'slpNativePrice',
      'treasuryBoost'
    ]),
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    slpTokenInfo(): SmallTokenInfo {
      return getMoveWethLPAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
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
      if (this.asset === undefined) {
        return '';
      }

      return (
        sameAddress(this.asset?.address, this.moveTokenInfo.address)
          ? this.$t('treasury.increaseBoost.txtYouChooseMove')
          : this.$t('treasury.increaseBoost.txtYouChooseMoveETHLp')
      ) as string;
    },
    currentInputSymbol(): string {
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
      return this.getTreasuryTokenBalance(this.asset.address);
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      if (!notZero(this.amount)) {
        return this.$t('treasury.decreaseBoost.lblChooseAmount') as string;
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

      if (sameAddress(this.asset.address, move.address)) {
        let inputedAmount = this.amount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceMove)) {
          inputedAmount = treasuryBalanceMove;
        }
        walletBalanceMove = add(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = sub(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.asset.address, slp.address)) {
        let inputedAmount = this.amount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceLP)) {
          inputedAmount = treasuryBalanceLP;
        }
        walletBalanceLP = add(walletBalanceLP, inputedAmount);
        treasuryBalanceLP = sub(treasuryBalanceLP, inputedAmount);
      }

      const futureBoost = calcTreasuryBoost(
        treasuryBalanceMove,
        treasuryBalanceLP,
        walletBalanceMove,
        walletBalanceLP,
        this.powercardState ?? 'NotStaked'
      );

      return `${formatToDecimals(futureBoost, 1)}x`;
    },
    formattedMaxAmount(): string {
      if (this.asset === undefined) {
        return '0';
      }

      if (this.selectedMode === 'TOKEN') {
        return `${formatToDecimals(this.maxInputAmount, 4)} ${
          this.asset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.maxInputAmount, this.asset.priceUSD),
          2
        )} ${this.nativeCurrencySymbol}`;
      }
    },
    selectorStyle(): CssProperties {
      if (this.asset === undefined) {
        return {
          backgroundColor: '#f1f1f1',
          boxShadow: '0 0 8px rgb(0, 0, 0, 0.5)'
        };
      }

      const assetColor = this.getTokenColor(this.asset.address);
      return {
        backgroundColor: assetColor,
        boxShadow: `0 0 8px ${assetColor}`
      };
    }
  },
  watch: {
    availableTokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (!this.isTokenSelectedByUser) {
            const move = newVal.find((t: TokenWithBalance) =>
              sameAddress(
                t.address,
                getMoveAssetData(this.networkInfo.network).address
              )
            );
            if (move) {
              this.asset = move;
            } else {
              if (newVal.length > 0) {
                this.asset = newVal[0];
              } else {
                this.asset = undefined;
              }
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
    getTreasuryTokenBalance(address: string): string {
      if (sameAddress(address, this.moveTokenInfo.address)) {
        return this.treasuryBalanceMove;
      }
      if (sameAddress(address, this.slpTokenInfo.address)) {
        return this.treasuryBalanceLP;
      }
      return '0';
    },
    async handleUpdateValue(val: string): Promise<void> {
      await this.updateValue(val, this.selectedMode);
    },
    async updateValue(value: string, mode: INPUT_MODE): Promise<void> {
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
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateWithdrawCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        Sentry.captureException("can't estimate treasury decrease");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
    },
    async handleTxReview(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }

      let isSubsidizedEnabled = false;
      let subsidizedTxPrice = undefined;
      let actionGasLimit = '0';
      let approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(this.amount, this.asset);

        actionGasLimit = gasLimits.actionGasLimit;
        approveGasLimit = gasLimits.approveGasLimit;

        console.info(
          'Treasury decrease boost action gaslimit:',
          actionGasLimit
        );
        console.info(
          'Treasury decrease boost approve gaslimit:',
          approveGasLimit
        );
      } catch (err) {
        isSubsidizedEnabled = false;
        console.error(
          `can't estimate treasury decrease boost for subs: ${err}`
        );
        Sentry.captureException(
          "can't estimate treasury decrease boost for subs"
        );
        return;
      } finally {
        this.isProcessing = false;
      }

      this.$emit('tx-review', {
        token: this.asset,
        amount: this.amount,
        nativeAmount: this.nativeAmount,
        isSubsidizedEnabled: isSubsidizedEnabled,
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
        await this.updateValue(this.maxInputAmount, 'TOKEN');
      } else {
        await this.updateValue(
          new BigNumber(
            multiply(this.maxInputAmount, this.asset.priceUSD)
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
          forceTokenArray: this.availableTokens
        }
      });

      if (token === undefined) {
        return;
      }

      this.isTokenSelectedByUser = true;
      this.asset = token;
      this.amount = '';
      this.nativeAmount = '';
    }
  }
});
</script>
