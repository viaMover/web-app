<template>
  <div class="action prepare">
    <secondary-page-header
      class="max-width"
      :description="headerDescription"
      :title="headerTitle"
    />
    <secondary-page-info
      :description="operationDescription"
      :title="operationTitle"
    />

    <form class="action form prepare" @submit.prevent="handleReviewTx">
      <div class="input section">
        <h2 class="title">{{ inputAssetHeading }}</h2>
        <div class="info">
          <pu-skeleton
            v-if="isLoading"
            circle
            class="token-icon smallest skeleton"
            tag="div"
          />
          <token-image
            v-else
            :address="asset ? asset.address : ''"
            class="smallest"
            :src="asset ? asset.logo : ''"
            :symbol="asset ? asset.symbol : ''"
          />
          <div class="token">
            <div class="name">
              {{ asset ? asset.name : $t('forms.lblChooseToken') }}
              <span class="symbol">
                {{ asset ? asset.symbol : '' }}
              </span>
            </div>
          </div>
          <button
            v-if="hasSelectModal"
            class="round smallest icon button"
            :style="selectorStyle"
            type="button"
            @click.stop.prevent="handleOpenSelectModal"
          >
            <arrow-down-icon :stroke="asset ? '#fff' : '#000'" />
          </button>
        </div>

        <div class="available">
          {{ $t('forms.lblAvailable') }}
          <span class="selector button-like" @click="handleSelectMaxAmount">{{
            formattedMaxAmount
          }}</span>
        </div>

        <div class="description">
          {{ selectedTokenDescription }}
        </div>
      </div>

      <div class="output section">
        <h2 class="title">
          {{ outputAssetHeadingText }}
          <span class="selector button-like" @click="handleToggleInputMode">
            {{ currentInputSymbol }}
          </span>
        </h2>
        <slot name="input">
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
        </slot>
        <slot name="swap-message" />
      </div>

      <div class="actions">
        <action-button
          class="primary"
          :disabled="!isButtonActive"
          propagate-original-event
          type="submit"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img
              :alt="$t('icon.txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
          </div>
          <template v-else>
            {{ isButtonActive ? $t('forms.lblReviewTransaction') : error }}
          </template>
        </action-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters, mapState } from 'vuex';

import BigNumber from 'bignumber.js';
import { Properties as CssProperties } from 'csstype';

import { greaterThan, multiply, notZero } from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { InputMode } from '@/components/forms/prepare-form/types';
import {
  SecondaryPageHeader,
  SecondaryPageInfo
} from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'PrepareForm',
  components: {
    TokenImage,
    SecondaryPageHeader,
    SecondaryPageInfo,
    ActionButton,
    ArrowDownIcon,
    DynamicInput
  },
  props: {
    isLoading: {
      type: Boolean,
      required: true
    },
    isProcessing: {
      type: Boolean,
      required: true
    },
    allowZeroAmount: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object as PropType<TokenWithBalance | undefined>,
      default: undefined
    },
    hasSelectModal: {
      type: Boolean,
      default: false
    },
    headerTitle: {
      type: String,
      default: ''
    },
    headerDescription: {
      type: String,
      default: ''
    },
    operationTitle: {
      type: String,
      default: ''
    },
    operationDescription: {
      type: String,
      default: ''
    },
    selectedTokenDescription: {
      type: String,
      default: ''
    },
    inputMode: {
      type: String as PropType<InputMode>,
      required: true
    },
    inputAssetHeading: {
      type: String,
      default: ''
    },
    inputAmount: {
      type: String,
      required: true
    },
    inputAmountNative: {
      type: String,
      required: true
    },
    transferError: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    outputAssetHeadingText: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState('account', ['networkInfo', 'nativeCurrency']),
    ...mapGetters('account', ['getTokenColor']),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    inputValue(): string {
      return this.inputMode === 'TOKEN'
        ? this.inputAmount
        : this.inputAmountNative;
    },
    currentInputSymbol(): string {
      if (this.inputMode === 'TOKEN') {
        return this.asset?.symbol ?? '';
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('forms.lblChooseToken') as string;
      }
      if (!notZero(this.inputAmount) && !this.allowZeroAmount) {
        return this.$t('forms.lblChooseAmount') as string;
      }
      if (
        greaterThan(this.inputAmount, this.asset?.balance ?? 0) &&
        !this.allowZeroAmount
      ) {
        return this.$t('lblInsufficientBalance') as string;
      }
      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading && !this.isProcessing;
    },
    formattedMaxAmount(): string {
      if (this.asset === undefined) {
        return `0`;
      }

      if (this.inputMode === 'TOKEN') {
        return `${formatToDecimals(
          this.asset.balance,
          4,
          BigNumber.ROUND_DOWN
        )} ${this.asset.symbol}`;
      }
      return `$${formatToDecimals(
        multiply(this.asset.balance, this.asset.priceUSD),
        2,
        BigNumber.ROUND_DOWN
      )} ${this.nativeCurrencySymbol}`;
    },
    selectorStyle(): CssProperties {
      if (this.asset === undefined) {
        return {
          backgroundColor: 'var(--color-icon-background-default)',
          boxShadow: '0 0 8px var(--color-shadow)'
        };
      }
      const assetColor = this.getTokenColor(this.asset.address);
      return {
        backgroundColor: assetColor,
        boxShadow: `0 0 8px ${assetColor}`
      };
    }
  },
  methods: {
    handleReviewTx(): void {
      this.$emit('review-tx');
    },
    handleOpenSelectModal(): void {
      this.$emit('open-select-modal');
    },
    handleSelectMaxAmount(): void {
      this.$emit('select-max-amount');
    },
    handleToggleInputMode(): void {
      this.$emit('toggle-input-mode');
    },
    handleUpdateValue(val: string): void {
      this.$emit('update-amount', val);
    }
  }
});
</script>
