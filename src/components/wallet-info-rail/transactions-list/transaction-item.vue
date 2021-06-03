<template>
  <div class="transaction-item">
    <div class="container">
      <img :alt="transaction.symbol" class="image" :src="transaction.symbol" />
      <div class="content">
        <span class="label">{{ transaction.heading }}</span>
        <span class="amount">{{ transaction.amount }}</span>
      </div>
    </div>
    <div>
      <span class="operation">{{
        `${true ? '-' : '+'} ${transaction.deducted}`
      }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Transaction } from '@/store/modules/account/types';

export default Vue.extend({
  name: 'TransactionItem',
  props: {
    transaction: {
      type: Object as PropType<Transaction>,
      required: true
    }
  }
});
</script>
