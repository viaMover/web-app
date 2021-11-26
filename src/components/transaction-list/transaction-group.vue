<template>
  <section class="group">
    <h2 class="header">{{ headingText }}</h2>
    <transition-group class="items" name="list-transition" tag="div">
      <transaction-item
        v-for="tx in transactions"
        :key="tx.uniqHash"
        class="list-transition-item"
        :transaction="tx"
      />
    </transition-group>
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
