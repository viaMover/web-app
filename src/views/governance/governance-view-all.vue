<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="product-item__wrapper governance__menu"
    wrapper-class="governance"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <governance-nav-my-governance />
        <governance-nav-manage-governance />
      </left-rail-section>
    </template>

    <secondary-page :title="$t('governance.lblGetInvolved')">
      <p class="description">{{ $t('governance.txtGetInvolved') }}</p>

      <governance-proposals />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  SecondaryPage,
  ContentWrapper,
  LeftRailSection
} from '@/components/layout';
import {
  GovernanceProposals,
  GovernanceNavMyGovernance,
  GovernanceNavManageGovernance
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceViewAll',
  components: {
    ContentWrapper,
    SecondaryPage,
    LeftRailSection,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
    GovernanceProposals
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
