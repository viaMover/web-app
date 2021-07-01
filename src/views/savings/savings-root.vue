<template>
  <content-wrapper
    has-back-button
    has-left-rail
    wrapper-class="general-desktop"
    @close="handleClose"
  >
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

import { ContentWrapper } from '@/components/layout';
import {
  SavingsOverview,
  SavingsStats,
  SavingsEstimation
} from '@/components/savings';

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
