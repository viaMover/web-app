<template>
  <centered-modal-window v-cloak modal-id="swap-modal" @toggle="handleToggled">
    <swap-form @tx-created="handleTxCreated"></swap-form>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';
import { SwapForm } from '@/components/forms';
import { toggleModal } from '@/components/toggle/toggle-root';

type HandleToggledPayload = {
  inputAssetAddress: string;
};

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
    handleToggled(payload?: HandleToggledPayload): void {
      this.inputAssetAddress = payload.inputAssetAddress ?? null;
    },
    handleTxCreated(txHash: Promise<string>): void {
      toggleModal(this.modalId);
      toggleModal('transaction-modal', {
        txHash
      });
    }
  }
});
</script>
