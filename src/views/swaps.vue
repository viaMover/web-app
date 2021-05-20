<template>
  <content-wrapper has-close-button @close="handleClose">
    <secondary-page :title="$t('lblSwaps')">
      <swap-form />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper, SecondaryPage } from '@/components/layout';
import { SwapForm } from '@/components/forms';

export default Vue.extend({
  name: 'Swaps',
  components: {
    ContentWrapper,
    SecondaryPage,
    SwapForm
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
