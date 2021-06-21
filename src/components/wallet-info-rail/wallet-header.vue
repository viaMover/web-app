<template>
  <div class="wallet">
    <div class="connect">
      <img alt="imageprofile" :src="'https://linkpicture.com/q/Group-6.png'" />
      <div class="content">
        <div class="label">
          <span class="id">0xf13</span>
          <img
            alt="arrow-down"
            class="arrow"
            src="@/assets/images/arrow-down.svg"
          />
        </div>
        <span class="disconnect">{{ $t('lblDisconnect') }}</span>
      </div>
    </div>
    <div class="input">
      <label for="wallet_address">{{ $t('lblWallet') }}</label>
      <select
        id="wallet_address"
        :value="currentAddress"
        @change="handleAddressChanged"
      >
        <option disabled :value="null">{{ $t('lblConnectWallet') }}</option>
        <option
          v-for="address in accountAddresses"
          :key="address"
          :value="address"
        >
          {{ address }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations, mapState } from 'vuex';
import Vue from 'vue';

export default Vue.extend({
  name: 'WalletHeader',
  computed: {
    ...mapState('account', [
      'detectedProvider',
      'provider',
      'addresses',
      'currentAddress'
    ]),
    metaMaskBtnText(): string {
      return this.detectedProvider ? 'Connect MetaMask' : 'Install MetaMask';
    },
    accountAddresses(): Array<string> {
      return this.addresses;
    }
  },
  methods: {
    ...mapMutations('account', { setCurrentWallet: 'setCurrentWallet' }),
    ...mapActions('account', { refreshWallet: 'refreshWallet' }),
    handleAddressChanged(address: string): void {
      this.setCurrentWallet(address);
      this.refreshWallet();
      this.$emit('selected-address-changed', address);
    }
  }
});
</script>
