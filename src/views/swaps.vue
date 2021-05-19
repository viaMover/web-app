<template>
  <content-wrapper has-close-button @close="handleClose">
    <secondary-page :title="$t('lblSwaps')">
      <swap-form />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';
import SecondaryPage from '@/components/layout/secondary-page.vue';
import SwapForm from '@/components/forms/swap-form.vue';

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
