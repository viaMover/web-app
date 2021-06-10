<template>
  <centered-modal-window v-cloak :modal-id="modalId">
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
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import CenteredModalWindow from './centered-modal-window.vue';

import { Transaction } from '@/store/modules/account/types';
import {
  subToggle,
  TogglePayload,
  unsubToggle
} from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals/modalTypes';

// probably enum will suit us better :?
type TransactionStatus = 'waiting' | 'pending' | 'processed' | 'reverted';
type TxHashPayload = Promise<string>;

// TODO: Should be reworked
// At least we should get tx status before displaying something
export default Vue.extend({
  name: 'TransactionModal',
  components: {
    CenteredModalWindow
  },
  data() {
    return {
      modalId: Modal.Transaction,
      hash: '',
      state: 'waiting' as TransactionStatus
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
  mounted() {
    subToggle(this.modalId, this.handleToggle);
  },
  beforeDestroy() {
    unsubToggle(this.modalId, this.handleToggle);
  },
  methods: {
    async handleToggle(
      togglePayload: TogglePayload<TxHashPayload>
    ): Promise<void> {
      if (togglePayload.payload === undefined) {
        return;
      }

      try {
        this.state = 'waiting';
        this.hash = await togglePayload.payload;
        this.state = 'pending';
      } catch {
        this.hash = '';
      }
    }
  }
});
</script>
