<template>
  <content-wrapper
    has-back-button
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <secondary-page :title="$t('governance.lblProposal')">
      <h2>{{ $t('governance.lblCreateAProposal') }}</h2>
      <div class="proposal-creator">
        <governance-proposal-create-overview />
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { GovernanceProposalCreateOverview } from '@/components/governance';
import { ContentWrapper, SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceCreateProposal',
  components: {
    ContentWrapper,
    SecondaryPage,
    GovernanceProposalCreateOverview
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
