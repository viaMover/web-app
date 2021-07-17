<template>
  <div>
    <wallet-header @selected-address-changed="handleSelectedAddressChanged" />
    <transaction-list :address="currentAddress" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import WalletHeader from './wallet-header.vue';
import TransactionList from './transactions-list/transaction-list.vue';

export default Vue.extend({
  name: 'WalletInfoRail',
  components: {
    WalletHeader,
    TransactionList
  },
  computed: {
    ...mapState('account', ['addresses', 'currentAddress'])
  },
  methods: {
    ...mapActions('account', { _setCurrentWallet: 'setCurrentWallet' }),
    handleSelectedAddressChanged(address: string): void {
      this._setCurrentWallet(address);
    }
  }
});
</script>
