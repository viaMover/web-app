<template>
  <centered-modal-window
    v-cloak
    :header-label="header"
    :modal-class="modalClass"
    modal-id="swap-modal"
  >
    <swap-form @tx-process="handleTxProcess"></swap-form>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';
import { SwapForm } from '@/components/forms';

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
      modalClass: 'swaps__popup',
      processing: false
    };
  },
  computed: {
    header(): string {
      return this.processing ? '' : this.$t('swaps.lblSwaps').toString();
    }
  },
  methods: {
    handleTxProcess(processing: boolean): void {
      this.processing = processing;
    }
  }
});
</script>
