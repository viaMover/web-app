<template>
  <centered-modal-window
    v-cloak
    :header-label="$t('swaps.lblSwaps')"
    modal-id="swap-modal"
  >
    <savings-deposit-form @tx-created="handleTxCreated"></savings-deposit-form>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals/modalTypes';

import CenteredModalWindow from '@/components/modals/centered-modal-window.vue';
import { SavingsDepositForm } from '@/components/forms';

export default Vue.extend({
  name: 'SavingsDepositModal',
  components: {
    CenteredModalWindow,
    SavingsDepositForm
  },
  data() {
    return {
      modalId: Modal.SavingsDeposit,
      inputAssetAddress: null as null | string
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
