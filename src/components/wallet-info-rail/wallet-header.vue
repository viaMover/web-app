<template>
  <div class="header">
    <div class="input">
      <label for="wallet_address">{{ $t('lblWallet') }}</label>
      <select
        id="wallet_address"
        :value="currentAddress"
        @change="handleAddressChanged"
      >
        <option disabled :value="null">{{ $t('lblConnectWallet') }}</option>
        <option v-for="address in addresses" :key="address" :value="address">
          {{ address }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'WalletHeader',
  props: {
    currentAddress: {
      type: String,
      required: false
    },
    addresses: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleAddressChanged(address: string): void {
      this.$emit('selected-address-changed', address);
    }
  }
});
</script>
