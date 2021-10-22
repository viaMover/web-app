<template>
  <form autocomplete="off" class="form" @submit.prevent="handleReviewTx">
    <slot name="input-asset-heading">
      <h2>{{ inputAssetHeading }}</h2>
    </slot>
    <div class="info">
      <token-image
        :address="inputAsset ? inputAsset.address : ''"
        :src="inputAsset ? inputAsset.logo : ''"
        :symbol="inputAsset ? inputAsset.symbol : ''"
        wrapper-class="icon"
      />
      <div class="coin">
        <p>
          {{ inputAsset ? inputAsset.name : '' }}
          <span>
            {{ inputAsset ? inputAsset.symbol : '' }}
          </span>
        </p>
      </div>
      <button
        class="button-active button-arrow"
        :style="selectorStyle"
        type="button"
        @click="handleOpenSelectModal"
      >
        <arrow-down-icon stroke="#fff" />
      </button>
    </div>
    <div class="available">
      <p>
        {{ $t('forms.lblAvailable') }}
        <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
      </p>
    </div>
    <slot name="input-asset-description">
      <div class="description">
        <p>{{ inputAssetDescription }}</p>
      </div>
    </slot>
    <p>
      {{ outputAssetHeadingText }}
      <span class="form-button" @click="handleToggleInputMode">
        {{ inputSymbol }}
      </span>
    </p>
    <dynamic-input
      :disabled="isLoading"
      input-class="deposit__form-input eth-input"
      name="text"
      placeholder="0.00"
      :symbol="inputSymbol"
      type="text"
      :value="inputValue"
      @update-value="handleUpdateValue"
    />
    <slot name="swapping-for" />
    <action-button
      button-class="black-link button-active"
      :disabled="!isButtonActive"
      propagate-original-event
      type="submit"
    >
      <div v-if="isLoading || isProcessing" class="loader-icon">
        <img alt="pending" src="@/assets/images/ios-spinner-white.svg" />
      </div>
      <template v-else>
        {{ isButtonActive ? $t('forms.lblReviewTransaction') : error }}
      </template>
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters, mapState } from 'vuex';

import BigNumber from 'bignumber.js';
import { Properties as CssProperties } from 'csstype';

import { greaterThan, multiply, notZero } from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { TokenWithBalance } from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { TokenImage } from '@/components/tokens';

import { INPUT_MODE } from '../types';

export default Vue.extend({
  name: 'DepositForm',
  components: {
    TokenImage,
    ActionButton,
    ArrowDownIcon,
    DynamicInput
  },
  props: {
    inputAsset: {
      type: Object as PropType<TokenWithBalance | undefined>,
      default: undefined
    },
    inputAssetHeading: {
      // e.g. 'what do we deposit / stake'
      type: String,
      required: true
    },
    inputAssetDescription: {
      // e.g. MOVE is a great asset
      type: String,
      required: true
    },
    inputMode: {
      type: String as PropType<INPUT_MODE>,
      required: true
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
    isLoading: {
      type: Boolean,
      required: true
    },
    isProcessing: {
      type: Boolean,
      required: true
    },
    outputAssetHeadingText: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('account', {
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapGetters('account', {
      getTokenColor: 'getTokenColor'
    }),
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    inputSymbol(): string {
      if (this.inputMode === 'TOKEN') {
        return this.inputAsset?.symbol ?? '';
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    error(): string | undefined {
      if (this.inputAsset === undefined) {
        return this.$t('forms.lblChooseToken') as string;
      }

      if (!notZero(this.inputAmount)) {
        return this.$t('forms.lblChooseAmount') as string;
      }

      if (greaterThan(this.inputAmount, this.inputAsset?.balance ?? 0)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }

      return undefined;
    },
    inputValue(): string {
      return this.inputMode === 'TOKEN'
        ? this.inputAmount
        : this.inputAmountNative;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
    },
    maxAmountText(): string {
      if (this.inputAsset === undefined) {
        return `0.00`;
      }

      if (this.inputMode === 'TOKEN') {
        return `${formatToDecimals(this.inputAsset.balance, 4)} ${
          this.inputAsset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.inputAsset.balance, this.inputAsset.priceUSD),
          2,
          BigNumber.ROUND_DOWN
        )} ${this.nativeCurrencySymbol}`;
      }
    },
    selectorStyle(): CssProperties {
      const assetColor = this.getTokenColor(this.inputAsset?.address);

      if (assetColor === undefined) {
        return {
          backgroundColor: '#f1f1f1',
          boxShadow: '0 0 8px #ccc'
        };
      }

      return {
        backgroundColor: assetColor,
        boxShadow: `0 0 8px ${assetColor}`
      };
    },
    formattedMaxAmount(): string {
      if (this.inputAsset === undefined) {
        return `0`;
      }

      if (this.inputMode === 'TOKEN') {
        return `${formatToDecimals(this.inputAsset.balance, 4)} ${
          this.inputAsset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.inputAsset.balance, this.inputAsset.priceUSD),
          2,
          BigNumber.ROUND_DOWN
        )} ${this.nativeCurrencySymbol}`;
      }
    }
  },
  methods: {
    handleUpdateValue(val: string): void {
      this.$emit('update-amount', val);
    },
    handleSelectMaxAmount() {
      this.$emit('select-max-amount');
    },
    handleOpenSelectModal() {
      this.$emit('open-select-modal');
    },
    handleReviewTx(): void {
      console.info('handleReviewTx');
      this.$emit('review-tx');
    },
    handleToggleInputMode(): void {
      this.$emit('toggle-input-mode');
    }
  }
});
</script>
