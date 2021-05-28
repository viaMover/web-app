<template>
  <content-wrapper has-close-button @close="handleClose">
    <div class="transaction-wrapper">
      <h2 class="title">
        {{ $t(`transaction.lblState.${state}`) }}
      </h2>
      <p>{{ txHash }}</p>
      <!-- todo: replace with SVG images-->
      <div v-if="state === 'waiting'">🕓</div>
      <div v-else-if="state === 'pending'">🐌</div>
      <div v-else-if="state === 'processed'">👌</div>
      <div v-else-if="state === 'reverted'">🚨</div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';

// probably enum will suit us better :?
type TransactionStatus = 'waiting' | 'pending' | 'processed' | 'reverted';

// TODO: delete once transition to the new design is finished
export default Vue.extend({
  name: 'Transaction',
  components: {
    ContentWrapper
  },
  data() {
    return {
      state: 'waiting' as TransactionStatus
    };
  },
  computed: {
    txHash(): string {
      return this.$route.params.txHash;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
