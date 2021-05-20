<template>
  <content-wrapper
    :has-back-button="hasBackButton"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <treasury-overview />
      <treasury-stats />
      <treasury-reserved-assets />
    </template>

    <router-view />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  TreasuryOverview,
  TreasuryStats,
  TreasuryReservedAssets
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    TreasuryOverview,
    TreasuryStats,
    TreasuryReservedAssets
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
