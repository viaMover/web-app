<template>
  <div class="transactions-list">
    <div v-if="!transactionGroups.length" class="transactions-list_empty-state">
      {{ $t('lblConnectWalletTransactionHistory') }}
    </div>
    <transaction-group
      v-for="txGroup in transactionGroups"
      v-else
      :key="txGroup.date"
      :heading-text="formatDate(txGroup.timeStamp)"
      :transactions="txGroup.transactions"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

import TransactionGroup from './transaction-group.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'TransactionList',
  components: {
    TransactionGroup
  },
  props: {
    address: {
      type: String,
      required: false
    }
  },
  computed: {
    ...mapGetters('account', {
      transactionGroups: 'transactionsGroupedByDay'
    })
  },
  methods: {
    formatDate(timestamp: number): string {
      const date = dayjs.unix(timestamp);

      if (dayjs().diff(date, 'days') <= 2) {
        return date.calendar();
      }
      return date.format('DD MMMM YY');
    }
  }
});
</script>
