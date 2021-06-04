<template>
  <div class="form-group">
    <div class="left">
      <div class="top">
        <div class="asset-icon">
          <img :alt="iconAlt" :src="iconSrc" />
        </div>
        <price-input-field
          :amount="amount"
          :field-id="`${fieldRole}-selected-amount`"
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
        <select
          :id="`${fieldRole}-asset`"
          :value="asset"
          @change="handleUpdateAsset($event.target.value)"
        >
          <option :value="null">{{ $t('swaps.lblChooseAsset') }}</option>
          <option v-for="asset in assets" :key="asset.address">
            {{ asset.name }}
          </option>
        </select>
      </div>
      <span v-if="asset">{{ selectMaxText }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import PriceInputField from './price-input-field.vue';

export default Vue.extend({
  name: 'AssetField',
  components: {
    PriceInputField
  },
  props: {
    asset: {
      type: Object,
      required: false
    },
    assets: {
      type: Array,
      required: true
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
    }
  },
  computed: {
    iconSrc(): string {
      return this.asset == null ? 'fallback-url' : this.asset.iconUrl;
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
    selectMaxText(): string {
      return (
        this.asset == null
          ? ''
          : this.$t('asset.lblSelectMax', {
              name: this.asset.name,
              amount: this.asset.amount
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
    handleUpdateAsset(asset: never): void {
      this.$emit('update-asset', asset);
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
