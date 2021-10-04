<template>
  <div class="transaction__wrapper">
    <div class="transaction__wrapper-status">
      <h1 class="title">{{ selectedStepData.title }}</h1>
      <p class="description">{{ selectedStepData.subtitle }}</p>
    </div>
    <div class="transaction__wrapper-gif">
      <video
        v-if="selectedStepData.id === 'Confirm'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionWalletWaiting.webm"
      />
      <video
        v-else-if="selectedStepData.id === 'Process'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionProcessing.webm"
      />
      <video
        v-else-if="selectedStepData.id === 'Success'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionSuccess.webm"
      />
      <video
        v-else-if="selectedStepData.id === 'Reverted'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionFailed.webm"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { StepData } from '@/components/controls/form-loader/types';

export default Vue.extend({
  name: 'SavingsFormLoader',
  props: {
    step: {
      type: String,
      default: 'Confirm'
    }
  },
  data() {
    return {
      stepsData: new Array<StepData>(
        {
          id: 'Confirm',
          title: 'Waiting for confirmation',
          subtitle: 'Confirm this transaction in your wallet'
        },
        {
          id: 'Process',
          title: 'Your transaction is processing',
          subtitle: 'Waiting for transaction to be confirmed'
        },
        {
          id: 'Success',
          title: 'Success',
          subtitle: 'Your transaction was successfully processed'
        },
        {
          id: 'Reverted',
          title: 'Transaction was reverted',
          subtitle:
            'Something went wrong, and your transaction wasn’t processed'
        }
      )
    };
  },
  computed: {
    selectedStepData(): StepData {
      return (
        this.stepsData.find((d) => d.id === this.step) ?? this.stepsData[0]
      );
    }
  }
});
</script>
