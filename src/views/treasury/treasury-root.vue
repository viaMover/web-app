<template>
  <content-wrapper
    has-back-button
    has-left-rail
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="smart-treasury"
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

import '@/styles/_treasury.less';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    TreasuryOverview,
    TreasuryStats,
    TreasuryReservedAssets
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
