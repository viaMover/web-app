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

    <template v-slot:modals>
      <treasury-increase-boost-modal />
      <treasury-decrease-boost-modal />
      <treasury-claim-and-burn-modal />
      <search-modal />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import {
  TreasuryOverview,
  TreasuryStats,
  TreasuryReservedAssets
} from '@/components/treasury';
import {
  SearchModal,
  TreasuryIncreaseBoostModal,
  TreasuryDecreaseBoostModal,
  TreasuryClaimAndBurnModal
} from '@/components/modals';

import '@/styles/_treasury.less';
import '@/styles/_general.less';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    TreasuryOverview,
    TreasuryStats,
    TreasuryReservedAssets,
    TreasuryIncreaseBoostModal,
    TreasuryDecreaseBoostModal,
    TreasuryClaimAndBurnModal,
    SearchModal
  },
  computed: {
    ...mapGetters('account', { hasActiveTreasury: 'hasActiveTreasury' }),
    isReplaceRouteNeeded(): boolean {
      return this.$route.name !== 'treasury-empty' && !this.hasActiveTreasury;
    }
  },
  watch: {
    isReplaceRouteNeeded(newVal: boolean) {
      if (newVal) {
        this.replaceInactiveTreasuryRoute();
      }
    }
  },
  beforeMount() {
    if (this.isReplaceRouteNeeded) {
      this.replaceInactiveTreasuryRoute();
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    replaceInactiveTreasuryRoute(): void {
      this.$router.replace({
        name: 'treasury-empty'
      });
    }
  }
});
</script>
