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

import { StepData } from './types';

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
          title: this.$t('transaction.lblState.waiting.header') as string,
          subtitle: this.$t(
            'transaction.lblState.waiting.description'
          ) as string
        },
        {
          id: 'Process',
          title: this.$t('transaction.lblState.pending.header') as string,
          subtitle: this.$t(
            'transaction.lblState.pending.description'
          ) as string
        },
        {
          id: 'Success',
          title: this.$t('transaction.lblState.processed.header') as string,
          subtitle: this.$t(
            'transaction.lblState.processed.description'
          ) as string
        },
        {
          id: 'Reverted',
          title: this.$t('transaction.lblState.reverted.header') as string,
          subtitle: this.$t(
            'transaction.lblState.reverted.description'
          ) as string
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
