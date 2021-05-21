<template>
  <content-wrapper
    :has-back-button="hasBackButton"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-proposal-create-overview />
    </template>

    <secondary-page :title="$t('governance.lblProposal')">
      <h2>{{ $t('governance.lblCreateAProposal') }}</h2>
      <div class="proposal-creator">
        TODO: Let's imagine a proposal creator here
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage, ContentWrapper } from '@/components/layout';
import { GovernanceProposalCreateOverview } from '@/components/governance';

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
