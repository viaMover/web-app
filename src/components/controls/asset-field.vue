/* eslint-disable max-len */
<template>
  <div class="swaps__wrapper-info-items-item">
    <div class="swaps__wrapper-info-items-item-left">
      <div v-if="iconSrc" class="icon">
        <img v-get-shadow :alt="iconAlt" :src="iconSrc" />
      </div>
      <price-input-field
        :amount="amount"
        :field-id="`${fieldRole}-selected-amount`"
        :max-amount="maxAmount"
        @update-amount="handleUpdateAmount"
      />
      <native-price-input-field
        :amount="nativeAmount"
        :field-id="`${fieldRole}-selected-native-amount`"
        text-prefix="≈"
        @update-amount="handleUpdateNativeAmount"
      />
    </div>
    <div class="swaps__wrapper-info-items-item-right">
      <button
        class="currency"
        type="button"
        @click.prevent.stop="handleOpenSelectModal"
      >
        <span>{{ openSelectModalText }}</span>
        <img src="@/assets/images/button-arrow-down.svg" />
      </button>

      <button
        v-if="showSelectMaxAmountButton"
        class="use"
        type="button"
        @click="handleSelectMaxAmount"
      >
        <img src="@/assets/images/plus.svg" />
        <span>{{ this.$t('asset.lblSelectMax') }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import PriceInputField from './price-input-field.vue';
import NativePriceInputField from './native-price-input-field.vue';
import { toggleThenWaitForResult } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';
import { TokenWithBalance } from '@/wallet/types';

export default Vue.extend({
  name: 'AssetField',
  components: {
    PriceInputField,
    NativePriceInputField
  },
  props: {
    asset: {
      type: Object as PropType<TokenWithBalance>,
      required: false
    },
    fieldRole: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    maxAmount: {
      type: String,
      default: undefined
    },
    nativeAmount: {
      type: String,
      required: true
    },
    useWalletTokens: {
      type: Boolean,
      default: false
    },
    excludeTokens: {
      type: Array as PropType<Array<TokenWithBalance>>,
      default: () => []
    }
  },
  computed: {
    iconSrc(): string {
      return this.asset == null ? '' : this.asset.logo;
    },
    iconAlt(): string {
      return (
        this.asset == null
          ? this.$t('asset.txtFallbackAlt', {
              fieldRole: this.fieldRole
            })
          : this.$t('asset.txtAlt', {
              name: this.asset.name
            })
      ) as string;
    },
    openSelectModalText(): string {
      if (this.asset == null) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      return `${this.asset.symbol}`;
    },
    showSelectMaxAmountButton(): boolean {
      return this.fieldRole === 'input' && !!this.asset;
    }
  },
  methods: {
    handleUpdateAmount(amount: number): void {
      this.$emit('update-amount', String(amount));
    },
    handleSelectMaxAmount(): void {
      if (this.asset?.balance) {
        this.$emit('update-amount', String(this.asset.balance));
      }
    },
    handleUpdateNativeAmount(amount: number): void {
      this.$emit('update-native-amount', String(amount));
    },
    handleUpdateAsset(asset: TokenWithBalance): void {
      this.$emit('update-asset', asset);
    },
    handleOpenSelectModal(): void {
      toggleThenWaitForResult(Modal.SearchToken, this.handleUpdateAsset, {
        useWalletTokens: this.useWalletTokens,
        excludeTokens: this.excludeTokens
      });
    }
  }
});
</script>
