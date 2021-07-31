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

    <centered-modal-window v-cloak :modal-id="TreasuryIncreaseBoostModalId">
      <treasury-increase-boost-form />
    </centered-modal-window>
    <centered-modal-window v-cloak :modal-id="TreasuryDecreaseBoostModalId">
      <treasury-decrease-boost-form />
    </centered-modal-window>
    <centered-modal-window v-cloak :modal-id="TreasuryClaimAndBurnModalId">
      <treasury-claim-and-burn-form />
    </centered-modal-window>
    <search-modal />
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
import {
  TreasuryIncreaseBoostForm,
  TreasuryDecreaseBoostForm,
  TreasuryClaimAndBurnForm
} from '@/components/forms';
import '@/styles/_treasury.less';
import { CenteredModalWindow, Modal, SearchModal } from '@/components/modals';
import { mapGetters } from 'vuex';
export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    TreasuryOverview,
    TreasuryStats,
    TreasuryReservedAssets,
    TreasuryIncreaseBoostForm,
    TreasuryDecreaseBoostForm,
    TreasuryClaimAndBurnForm,
    CenteredModalWindow,
    SearchModal
  },
  data() {
    return {
      TreasuryIncreaseBoostModalId: Modal.TreasuryIncreaseBoost,
      TreasuryDecreaseBoostModalId: Modal.TreasuryDecreaseBoost,
      TreasuryClaimAndBurnModalId: Modal.TreasuryClaimAndBurn
    };
  },
  computed: {
    ...mapGetters('account', { hasActiveTreasury: 'hasActiveTreasury' }),
    isReplaceRouteNeeded(): boolean {
      return this.$route.name !== 'treasury-empty' && !this.hasActiveTreasury;
    }
  },
  watch: {
    isReplaceRouteNeeded(newVal: boolean) {
      if (!newVal) {
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
