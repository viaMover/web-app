<template>
  <content-wrapper has-close-button @close="handleClose">
    <div class="transaction-wrapper">
      <h2 class="title">
        {{ $t(`transactionPage.lblState.${state}`) }}
      </h2>
      <p>{{ txHash }}</p>
      <!-- todo: replace with SVG images-->
      <div v-if="state === 'pending'">🐌</div>
      <div v-else-if="state === 'processed'">👌</div>
      <div v-else-if="state === 'failed'">🚨</div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';

// probably enum will suit us better :?
type TransactionStatus = 'pending' | 'processed' | 'failed';

export default Vue.extend({
  name: 'Transaction',
  components: {
    ContentWrapper
  },
  data() {
    return {
      state: 'pending' as TransactionStatus
    };
  },
  computed: {
    txHash(): string {
      return this.$route.params.txHash;
    }
  },
  methods: {
    handleClose(): string {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
