<template>
  <div class="general-desktop__sidebar-wrapper-info-item">
    <div class="label">
      <div class="label-icon">
        <img v-get-shadow :alt="transaction.symbol" :src="tokenImageSrc" />
      </div>
      <div class="label-info">
        <p>{{ transaction.heading }}</p>
        <span>{{ transaction.amount }}</span>
      </div>
    </div>
    <div class="volume">
      <span>{{ `${true ? '-' : '+'} ${transaction.value || 0}` }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import { Transaction, Token } from '@/wallet/types';

export default Vue.extend({
  name: 'TransactionItem',
  props: {
    transaction: {
      type: Object as PropType<Transaction>,
      required: true
    }
  },
  computed: {
    ...mapState('account', ['allTokens']),
    tokenImageSrc(): string {
      return (
        (this.allTokens as Array<Token>).find(
          (t) =>
            t.address.toLowerCase() === this.transaction.symbol?.toLowerCase()
        )?.logo ?? ''
      );
    }
  }
});
</script>
