<template>
  <content-wrapper has-close-button has-left-rail @close="handleClose">
    <template v-slot:left-rail>
      <savings-overview />
      <savings-stats />
      <savings-estimation />
    </template>

    <router-view />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';
import SavingsOverview from '@/components/savings/savings-overview.vue';
import SavingsStats from '@/components/savings/savings-stats.vue';
import SavingsEstimation from '@/components/savings/savings-estimation.vue';

export default Vue.extend({
  name: 'SavingsRoot',
  components: {
    ContentWrapper,
    SavingsOverview,
    SavingsStats,
    SavingsEstimation
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
