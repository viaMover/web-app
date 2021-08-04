<template>
  <div>
    <form class="transaction-search-form">
      <input />
      <button class="button-active" type="button" @click.prevent.stop="">
        🔍
      </button>
    </form>
    <transaction-list :address="currentAddress" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import TransactionList from './transactions-list/transaction-list.vue';

export default Vue.extend({
  name: 'WalletInfoRail',
  components: {
    TransactionList
  },
  computed: {
    ...mapState('account', ['currentAddress'])
  }
});
</script>
