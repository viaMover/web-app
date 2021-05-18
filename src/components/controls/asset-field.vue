<template>
  <div class="form-group">
    <div class="asset-icon">
      <img :alt="iconAlt" :src="iconSrc" />
    </div>
    <div class="dropdown input">
      <label :for="`${fieldRole}-asset`">{{ label }}</label>
      <select
        :id="`${fieldRole}-asset`"
        :value="asset"
        @change="handleUpdateAsset($event.target.value)"
      >
        <option :value="null">{{ $t('swapsPage.lblChooseAsset') }}</option>
        <option v-for="asset in assets" :key="asset.address">
          {{ asset.name }}
        </option>
      </select>
    </div>
    <span v-if="asset">{{ selectMaxText }}</span>
    <div class="prices">
      <price-input-field
        :amount="amount"
        :field-id="`${fieldRole}-selected-amount`"
        @update-amount="handleUpdateAmount"
      />
      <price-input-field
        :amount="nativeAmount"
        :field-id="`${fieldRole}-selected-native-amount`"
        text-prefix="≈"
        @update-amount="handleUpdateNativeAmount"
      />
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
          ? this.$t('swapsPage.asset.txtFallbackAlt', {
              fieldRole: this.fieldRole
            })
          : this.$t('swapsPage.asset.txtAlt', {
              name: this.asset.name
            })
      ) as string;
    },
    selectMaxText(): string {
      return (
        this.asset == null
          ? ''
          : this.$t('swapsPage.asset.lblSelectMax', {
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
