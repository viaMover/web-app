<template>
  <content-wrapper
    :has-back-button="hasBackButton"
    has-close-button
    has-left-rail
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
  computed: {
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
