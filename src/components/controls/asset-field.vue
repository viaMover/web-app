<template>
  <div
    class="modal-wrapper-info-items-item"
    :class="{ 'couple-tokens': hasCoupleTokens }"
  >
    <div class="modal-wrapper-info-items-item-left">
      <div v-if="iconSrc" class="icon">
        <img v-get-shadow="asset.color" :alt="iconAlt" :src="iconSrc" />
      </div>
      <div v-else class="icon"></div>
      <price-input-field
        :amount="amount"
        :disabled="disabledInput"
        :field-id="`${fieldRole}-selected-amount`"
        :input-class="'input-top'"
        :max-amount="maxAmount"
        :placeholder="placeholder"
        @update-amount="handleUpdateAmount"
      />
      <price-input-field
        :amount="nativeAmount"
        :disabled="disabledInput"
        :field-id="`${fieldRole}-selected-native-amount`"
        :input-class="'input-bottom'"
        :placeholder="placeholder"
        text-prefix="≈$"
        @update-amount="handleUpdateNativeAmount"
      />
    </div>
    <div class="modal-wrapper-info-items-item-right">
      <button
        class="currency button-active"
        type="button"
        @click.prevent.stop="handleOpenSelectModal"
      >
        <span>{{ openSelectModalText }}</span>
        <img src="@/assets/images/button-arrow-down.svg" />
      </button>

      <button
        v-if="showSelectMaxAmountButton"
        class="use button-active"
        type="button"
        @click="handleSelectMaxAmount"
      >
        <img src="@/assets/images/plus.svg" />
        <span>{{ this.$t('asset.lblSelectMax') }}</span>
      </button>
      <p v-else-if="showTokenBalance && tokenBalance">
        Balance: {{ tokenBalance }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import PriceInputField from './price-input-field.vue';
import { toggleThenWaitForResult } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';
import { TokenWithBalance } from '@/wallet/types';
import { mapState } from 'vuex';
import { sameAddress } from '@/utils/address';
import { formatToDecimals } from '@/utils/format';

export default Vue.extend({
  name: 'AssetField',
  components: {
    PriceInputField
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
    },
    disabledSelectCurrency: {
      type: Boolean,
      default: false
    },
    hasCoupleTokens: {
      type: Boolean,
      default: false
    },
    showTokenBalance: {
      type: Boolean,
      default: false
    },
    treasuryOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('account', ['tokens']),
    placeholder(): string {
      return this.asset == null ? '—' : '0.00';
    },
    disabledInput(): boolean {
      return this.asset == null;
    },
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
    },
    tokenBalance(): string {
      if (this.asset !== undefined) {
        const token = this.tokens.find((t: TokenWithBalance) =>
          sameAddress(this.asset.address, t.address)
        );
        if (token) {
          return `${formatToDecimals(token.balance, 4)} ${token.symbol}`;
        }
        return '0.0000';
      }
      return '';
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
      if (!this.disabledSelectCurrency) {
        toggleThenWaitForResult(Modal.SearchToken, this.handleUpdateAsset, {
          useWalletTokens: this.useWalletTokens,
          excludeTokens: this.excludeTokens,
          treasuryOnly: this.treasuryOnly
        });
      }
    }
  }
});
</script>
