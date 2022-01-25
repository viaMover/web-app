<template>
  <content-wrapper
    class="governance"
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-nav-my-governance />
      <governance-nav-manage-governance />
    </template>

    <secondary-page class="view view-all" hide-info>
      <template v-slot:title>
        <secondary-page-header
          :description="$t('governance.txtGetInvolved')"
          :title="$t('governance.lblGetInvolved')"
        />
      </template>

      <governance-proposals />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  GovernanceNavManageGovernance,
  GovernanceNavMyGovernance,
  GovernanceProposals
} from '@/components/governance';
import {
  ContentWrapper,
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceViewAll',
  components: {
    ContentWrapper,
    SecondaryPage,
    SecondaryPageHeader,
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
