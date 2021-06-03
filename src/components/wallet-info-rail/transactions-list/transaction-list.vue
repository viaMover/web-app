<template>
  <div class="transactions-list">
    <div v-if="!transactionGroups.length" class="empty-state">
      {{ $t('lblConnectWalletTransactionHistory') }}
    </div>
    <transaction-group
      v-for="txGroup in transactionGroups"
      v-else
      :key="txGroup.date"
      :heading-text="formatDate(txGroup.timeStamp)"
      :transactions="txGroup.transactions"
    />
    <!-- component with dummy data -->
    <transaction-group
      v-for="txGroup in dummyTransactionData"
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
import { dummyTransactionData } from './dummy-data';

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
  data: function () {
    return {
      dummyTransactionData
    };
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
