<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="smart-treasury"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <treasury-left-rail />
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

import { ContentWrapper } from '@/components/layout';
import {
  SearchModal,
  TreasuryClaimAndBurnModal,
  TreasuryDecreaseBoostModal,
  TreasuryIncreaseBoostModal
} from '@/components/modals';
import { TreasuryLeftRail } from '@/components/treasury';

import '@/styles/_treasury.less';
import '@/styles/_general.less';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    TreasuryLeftRail,
    ContentWrapper,
    TreasuryIncreaseBoostModal,
    TreasuryDecreaseBoostModal,
    TreasuryClaimAndBurnModal,
    SearchModal
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
