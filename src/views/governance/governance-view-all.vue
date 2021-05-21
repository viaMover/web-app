<template>
  <content-wrapper
    :has-back-button="hasBackButton"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-overview />
      <governance-stats />
    </template>

    <secondary-page
      :has-heading-buttons="isCreateProposalAvailable"
      :title="$t('governance.lblGovernance')"
    >
      <template v-if="isCreateProposalAvailable" v-slot:heading-buttons>
        <heading-nav-button
          button-class="transparent"
          navigate-to-name="governance-create"
        >
          {{ $t('governance.btnCreateAProposal.emoji') }}
        </heading-nav-button>
      </template>

      <h2>{{ $t('governance.lblGetInvolved') }}</h2>
      <governance-proposals />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage, ContentWrapper } from '@/components/layout';
import { HeadingNavButton } from '@/components/buttons';
import {
  GovernanceOverview,
  GovernanceProposals,
  GovernanceStats
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceViewAll',
  components: {
    ContentWrapper,
    SecondaryPage,
    HeadingNavButton,
    GovernanceOverview,
    GovernanceProposals,
    GovernanceStats
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
