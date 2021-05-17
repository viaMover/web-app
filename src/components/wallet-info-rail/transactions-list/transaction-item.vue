<template>
  <div class="transaction-item">{{ transaction.hash }}</div>
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
