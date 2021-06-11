<template>
  <div class="transaction-group">
    <h4 class="heading">{{ headingText }}</h4>
    <div class="list">
      <transaction-item
        v-for="tx in transactions"
        :key="tx.hash"
        class="item"
        :transaction="tx"
      ></transaction-item>
    </div>
  </div>
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
