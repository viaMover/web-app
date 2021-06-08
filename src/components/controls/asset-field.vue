<template>
  <div class="form-group">
    <div class="left">
      <div class="top">
        <img :alt="iconAlt" class="asset-icon" :src="iconSrc" />
        <price-input-field
          :amount="amount"
          :field-id="`${fieldRole}-selected-amount`"
          :max-amount="maxAmount"
          @update-amount="handleUpdateAmount"
        />
      </div>
      <div class="bottom">
        <price-input-field
          :amount="nativeAmount"
          :field-id="`${fieldRole}-selected-native-amount`"
          text-prefix="≈"
          @update-amount="handleUpdateNativeAmount"
        />
      </div>
    </div>
    <div class="right">
      <div class="dropdown input">
        <label :for="`${fieldRole}-asset`">{{ label }}</label>
        <button @click.prevent.stop="handleOpenSelectModal">
          Open token search
        </button>
      </div>
      <span v-if="asset">{{ selectMaxText }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import PriceInputField from './price-input-field.vue';
import {
  subResult,
  toggleSingleItem,
  unsubResult
} from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';
import { CoingeckoToken } from '@/services/coingecko/tokens';
import { Token } from '@/store/modules/account/types';

export default Vue.extend({
  name: 'AssetField',
  components: {
    PriceInputField
  },
  props: {
    asset: {
      type: Object as PropType<Token>,
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
      type: Number,
      required: true
    },
    nativeAmount: {
      type: Number,
      required: true
    },
    useWalletTokens: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconSrc(): string {
      return this.asset == null ? 'fallback-url' : this.asset.logo;
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
    maxAmount(): string | undefined {
      if (this.asset == null) {
        return undefined;
      }

      return this.asset.balance;
    },
    selectMaxText(): string {
      return (
        this.asset == null
          ? ''
          : this.$t('asset.lblSelectMax', {
              name: this.asset.name,
              amount: this.asset.balance
            })
      ) as string;
    }
  },
  methods: {
    handleUpdateAmount(amount: number): void {
      this.$emit('update-amount', amount);
    },
    handleUpdateNativeAmount(amount: number): void {
      this.$emit('update-native-amount', amount);
    },
    handleUpdateAsset(asset: CoingeckoToken): void {
      toggleSingleItem(Modal.SearchToken);
      unsubResult(Modal.SearchToken, this.handleUpdateAsset);
      this.$emit('update-asset', asset);
    },
    handleOpenSelectModal(): void {
      subResult(Modal.SearchToken, this.handleUpdateAsset);
      toggleSingleItem(Modal.SearchToken, {
        useWalletTokens: this.useWalletTokens
      });
    }
  }
});
</script>

<style lang="less">
.form-group {
  margin: 0.5rem;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

  .left,
  .right {
    display: flex;
    flex-flow: column nowrap;
  }

  .left {
    flex: 1 0 50%;

    .top {
      display: flex;
      width: 100%;
      flex-flow: row nowrap;
      margin-bottom: 1rem;

      .asset-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 1rem;
        margin-right: 0.25rem;
      }
    }
  }

  .right {
    flex: 0 1 30%;
    align-items: end;

    .dropdown.input {
      label {
        display: none;
      }
    }
  }
}
</style>
