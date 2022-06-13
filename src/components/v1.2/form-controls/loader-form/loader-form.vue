<template>
  <div class="transaction-wrapper">
    <div class="status">
      <template v-if="step === 'Confirm'">
        <h1 class="title">{{ $t('waiting') }}</h1>
        <div class="description">{{ $t('waitingDescription') }}</div>
      </template>
      <template v-else-if="step === 'Process'">
        <h1 class="title">{{ $t('process') }}</h1>
        <div class="description">{{ $t('processDescription') }}</div>
      </template>
      <template v-else-if="step === 'Success'">
        <h1 class="title">{{ $t('processed') }}</h1>
        <div class="description">{{ $t('processedDescription') }}</div>
      </template>
      <template v-else-if="step === 'Reverted'">
        <h1 class="title">{{ $t('reverted') }}</h1>
        <div class="description">{{ $t('revertedDescription') }}</div>
      </template>
      <slot name="additionalSubtitle"></slot>
    </div>
    <div class="gif">
      <video
        v-if="step === 'Confirm'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionWalletWaiting.webm"
      />
      <video
        v-else-if="step === 'Process'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionProcessing.webm"
      />
      <video
        v-else-if="step === 'Success'"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        src="@/assets/videos/TransactionSuccess.webm"
      />
      <video
        v-else-if="step === 'Reverted'"
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

export default Vue.extend({
  name: 'LoaderForm',
  props: {
    step: {
      type: String,
      required: true
    }
  }
});
</script>
