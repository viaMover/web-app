<template>
  <div class="general-desktop__sidebar-wrapper-user">
    <div class="user user1"><span class="icon">🦁</span></div>
    <button type="button">
      <span>{{ currentAddressText }}</span>
      <img
        :alt="$t('txtChangeWalletAlt')"
        src="@/assets/images/arrow-down.svg"
      />
    </button>
    <!-- <div class="input">
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
    </div> -->
    <button class="status" @click.prevent="disconnectWallet">
      {{ $t('lblDisconnect') }}
    </button>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations, mapState } from 'vuex';
import Vue from 'vue';

export default Vue.extend({
  name: 'WalletHeader',
  computed: {
    ...mapState('account', ['currentAddress']),
    currentAddressText(): string {
      if (this.currentAddress) {
        const val = this.currentAddress as string;
        const cutSize = 3;

        return [
          ...val.slice(0, cutSize + 2),
          '...',
          ...val.slice(val.length - cutSize, val.length)
        ].join('');
      }

      return this.$t('btnConnectWallet') as string;
    }
  },
  methods: {
    ...mapMutations('account', { setCurrentWallet: 'setCurrentWallet' }),
    ...mapActions('account', {
      refreshWallet: 'refreshWallet',
      clearWalletState: 'disconnectWallet'
    }),
    handleAddressChanged(address: string): void {
      this.setCurrentWallet(address);
      this.refreshWallet();
      this.$emit('selected-address-changed', address);
    },
    disconnectWallet(): void {
      this.clearWalletState();
      window.location.reload();
    }
  }
});
</script>
