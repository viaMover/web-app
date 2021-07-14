<template>
  <div class="general-desktop__sidebar-wrapper-user">
    <div class="user user1"><span class="icon">🦁</span></div>
    <button class="button-active" type="button">
      <span>{{ currentAddressText }}</span>
      <img
        :alt="$t('txtChangeWalletAlt')"
        src="@/assets/images/arrow-down.svg"
      />
    </button>
    <button @click.prevent="disconnectWallet">
      <span class="status">
        {{ $t('lblDisconnect') }}
      </span>
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
