<template>
  <content-wrapper has-close-button @close="handleClose">
    <h2>{{ $t('lblSwaps') }}</h2>
    <swap-form></swap-form>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';
import SwapForm from '@/components/forms/swap-form.vue';

export default Vue.extend({
  name: 'Swaps',
  components: {
    ContentWrapper,
    SwapForm
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
