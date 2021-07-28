<template>
  <div class="transaction-result__popup-wrapper">
    <div class="transaction-result__popup-wrapper-gif">
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
    <div class="transaction-result__popup-wrapper-status">
      <h2>{{ selectedStepData.title }}</h2>
      <p>{{ selectedStepData.subtitle }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export type Step = 'Confirm' | 'Process' | 'Success' | 'Reverted';

type StepData = {
  id: Step;
  title: string;
  subtitle: string;
};

export default Vue.extend({
  name: 'FormLoader',
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
          title: 'Success!',
          subtitle: 'Your transaction was processed'
        },
        {
          id: 'Reverted',
          title: 'Transaction was reverted!',
          subtitle: 'Your transaction failed'
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
