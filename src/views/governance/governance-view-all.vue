<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <governance-nav-my-governance />
        <governance-nav-manage-governance />
      </left-rail-section>
    </template>

    <secondary-page
      :has-heading-buttons="isCreateProposalAvailable"
      :title="$t('governance.lblGovernance')"
    >
      <h2>{{ $t('governance.lblGetInvolved') }}</h2>
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
  computed: {
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    isCreateProposalAvailable(): boolean {
      return true;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
