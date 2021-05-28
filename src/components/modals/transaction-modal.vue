<template>
  <modal-window
    v-show="transaction && isVisible"
    has-close-button
    @close="isVisible"
  >
    <div v-if="state === 'waiting'">🕓</div>
    <div v-else-if="state === 'pending'">🐌</div>
    <div v-else-if="state === 'processed'">👌</div>
    <div v-else-if="state === 'reverted'">🚨</div>
    <h2 class="title">
      {{ $t(`transaction.lblState.${state}.header`) }}
    </h2>
    <div class="description">
      {{ $t(`transaction.lblState.${state}.description`) }}
    </div>
  </modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import ModalWindow from './modal-window.vue';
import { mapState } from 'vuex';
import { Transaction } from '@/store/modules/account/types';

// probably enum will suit us better :?
type TransactionStatus = 'waiting' | 'pending' | 'processed' | 'reverted';

// TODO: Should be reworked
// At least we should get tx status before displaying something
export default Vue.extend({
  name: 'TransactionModal',
  components: {
    ModalWindow
  },
  props: {
    hash: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      state: 'waiting' as TransactionStatus,
      isVisible: false
    };
  },
  computed: {
    ...mapState('account', ['transactions']),
    transaction(): Transaction | null {
      return (
        (this.transactions as Array<Transaction>).find(
          (tx: Transaction) => tx.hash === this.hash
        ) ?? null
      );
    }
  },
  methods: {
    toggleIsVisible(): void {
      this.isVisible = !this.isVisible;
    }
  }
});
</script>
