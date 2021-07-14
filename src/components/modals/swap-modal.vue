<template>
  <centered-modal-window
    v-cloak
    :header-label="$t('swaps.lblSwaps')"
    :modal-class="modalClass"
    modal-id="swap-modal"
  >
    <swap-form @tx-created="handleTxCreated"></swap-form>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';
import { SwapForm } from '@/components/forms';

import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals/modalTypes';

export default Vue.extend({
  name: 'SwapModal',
  components: {
    CenteredModalWindow,
    SwapForm
  },
  data() {
    return {
      modalId: Modal.Swap,
      modalClass: 'swaps__popup'
    };
  },
  methods: {
    handleTxCreated(txHash: Promise<string>): void {
      toggleSingleItem(this.modalId);
      toggleSingleItem(
        Modal.Transaction,
        new Promise<string>((resolve) =>
          window.setTimeout(() => resolve(txHash), 5000)
        )
      );
    }
  }
});
</script>
