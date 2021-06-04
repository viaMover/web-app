<template>
  <centered-modal-window v-cloak modal-id="swap-modal">
    <swap-form @tx-created="handleTxCreated"></swap-form>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';
import { SwapForm } from '@/components/forms';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'SwapModal',
  components: {
    CenteredModalWindow,
    SwapForm
  },
  data() {
    return {
      modalId: 'swap-modal',
      inputAssetAddress: null as null | string
    };
  },
  methods: {
    handleTxCreated(txHash: Promise<string>): void {
      toggleSingleItem(this.modalId);
      toggleSingleItem(
        'transaction-modal',
        new Promise<string>((resolve) =>
          window.setTimeout(() => resolve(txHash), 5000)
        )
      );
    }
  }
});
</script>
