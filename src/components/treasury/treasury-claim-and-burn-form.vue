<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="
          $t('treasury.claimAndBurn.txtClaimAndBurnPageDescription')
        "
        :title="$t('treasury.claimAndBurn.lblClaimAndBurn')"
      />
      <div class="secondary_page-token-info">
        <span>{{ claimingForStr }}</span>
        <p>{{ $t('treasury.claimAndBurn.txtYouApproximateExit') }}</p>
      </div>
    </div>
    <div class="secondary_page-body">
      <h2>{{ $t('treasury.claimAndBurn.lblWhatDoWeBurn') }}</h2>
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
          {{ $t('treasury.claimAndBurn.lblAvailable') }}
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
          {{ $t('treasury.claimAndBurn.lblAmountWeBurnIn') }}
          <span class="form-button" @click.capture.stop.prevent="swapTokens">
            {{ currentInputSymbol }}
          </span>
        </p>
        <dynamic-input
          :disabled="isLoading"
          input-class="deposit__form-input eth-input"
          name="text"
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

import { getExitingAmount, getMaxBurn } from '@/services/chain';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  multiply,
  notZero
} from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { estimateClaimAndBurnCompound } from '@/wallet/actions/treasury/claimAndBurn/claimAndBurnEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import { getMoveAssetData, getUSDCAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

type INPUT_MODE = 'NATIVE' | 'TOKEN';

export default Vue.extend({
  name: 'TreasuryClaimAndBurnForm',
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
      claimingFor: '0',
      amount: '',
      nativeAmount: '',
      transferError: undefined as undefined | string,
      maxBurnedAmount: undefined as undefined | string,
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
      'nativeCurrency'
    ]),
    ...mapGetters('account', [
      'treasuryBonusNative',
      'getTokenColor',
      'moveNativePrice'
    ]),
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    claimingForStr(): string {
      if (this.asset === undefined) {
        return '';
      }
      return `${formatToDecimals(this.claimingFor, 6)} ${
        getUSDCAssetData(this.networkInfo.network).symbol
      }`;
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    description(): string {
      return (
        this.asset !== undefined
          ? this.$t('treasury.claimAndBurn.txtYouChooseMove')
          : ''
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
      return this.asset.balance;
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      if (!notZero(this.amount)) {
        return this.$t('treasury.claimAndBurn.lblChooseAmount') as string;
      }

      if (greaterThan(this.amount, this.maxInputAmount)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    inputValue(): string {
      return this.selectedMode === 'TOKEN' ? this.amount : this.nativeAmount;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
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
    availableTokens(): Array<TokenWithBalance> {
      const move = getMoveAssetData(this.networkInfo.network);
      const moveWalletBalance =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      if (greaterThan(moveWalletBalance, '0')) {
        return [
          {
            address: move.address,
            decimals: move.decimals,
            name: move.name,
            symbol: move.symbol,
            priceUSD: this.moveNativePrice,
            logo: move.iconURL,
            isFavorite: true,
            isVerified: true,
            balance: moveWalletBalance,
            marketCap: Number.MAX_SAFE_INTEGER
          }
        ];
      }
      return [];
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
    tokens: {
      immediate: true,
      async handler(newVal: Array<TokenWithBalance>) {
        this.isLoading = true;
        try {
          if (!this.isTokenSelectedByUser) {
            const move = newVal.find((t: TokenWithBalance) =>
              sameAddress(t.address, this.moveTokenInfo.address)
            );
            if (move) {
              this.asset = move;
            }
          }

          this.maxBurnedAmount = await getMaxBurn(
            this.currentAddress,
            this.networkInfo.network,
            this.provider.web3
          );
        } catch (err) {
          console.log(`can't load max burn: ${JSON.stringify(err)}`);
          Sentry.captureException(err);
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
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
          this.nativeAmount = new BigNumber(
            convertNativeAmountFromAmount(value, this.asset.priceUSD)
          ).toFixed(2);

          if (this.maxBurnedAmount === undefined) {
            this.transferError = this.$t('treasury.claimAndBurn.lblBurnError');
            return;
          }

          if (greaterThan(this.amount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            );
            return;
          }

          this.claimingFor = await getExitingAmount(
            this.currentAddress,
            this.amount,
            this.networkInfo.network,
            this.provider.web3
          );

          this.transferError = undefined;
        } else {
          this.amount = convertAmountFromNativeValue(
            value,
            this.asset.priceUSD,
            this.asset.decimals
          );
          this.nativeAmount = value;

          if (this.maxBurnedAmount === undefined) {
            this.transferError = this.$t('treasury.claimAndBurn.lblBurnError');
            return;
          }

          if (greaterThan(this.amount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            );
            return;
          }
          this.claimingFor = await getExitingAmount(
            this.currentAddress,
            this.amount,
            this.networkInfo.network,
            this.provider.web3
          );
          this.transferError = undefined;
        }
      } catch (err) {
        this.transferError = this.$t('exchangeError') as string;
        console.error(`transfer error: ${err}`);
        Sentry.captureException(err);
        if (mode === 'TOKEN') {
          this.nativeAmount = '0';
        } else {
          this.amount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateClaimAndBurnCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        this.transferError = this.$t('estimationError') as string;
        Sentry.captureException("can't estimate claim and burn");
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

        console.info('Claim and burn action gaslimit:', actionGasLimit);
        console.info('Claim and burn approve gaslimit:', approveGasLimit);
      } catch (err) {
        isSubsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate claim and burn for subs");
        return;
      } finally {
        this.isProcessing = false;
      }

      this.$emit('tx-review', {
        token: this.asset,
        amount: this.amount,
        nativeAmount: this.claimingFor,
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
        await this.updateValue(this.asset.balance, 'TOKEN');
      } else {
        await this.updateValue(
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
          forceTokenArray: this.availableTokens
        }
      });

      if (token === undefined) {
        return;
      }

      this.isTokenSelectedByUser = true;
      this.asset = token;
      this.transferError = undefined;
      this.amount = '';
      this.nativeAmount = '';
    }
  }
});
</script>
