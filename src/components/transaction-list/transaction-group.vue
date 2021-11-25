<template>
  <section class="group">
    <h2 class="header">{{ headingText }}</h2>
    <div class="items">
      <transaction-item
        v-for="tx in transactions"
        :key="tx.uniqHash"
        :transaction="tx"
      />
    </div>
  </section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Transaction } from '@/wallet/types';

import TransactionItem from './transaction-item.vue';

export default Vue.extend({
  name: 'TransactionGroup',
  components: {
    TransactionItem
  },
  props: {
    headingText: {
      type: String,
      required: true
    },
    transactions: {
      type: Array as PropType<Array<Transaction>>,
      required: true
    }
  }
});
</script>
