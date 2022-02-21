<template>
  <secondary-page class="view" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header :title="pageTitle" />
    </template>

    <div class="text">
      <div v-if="proposal === undefined" class="skeleton-text">
        <pu-skeleton v-for="idx in 8" :key="idx" tag="p" />
      </div>
      <template v-else>
        <markdown
          v-if="isFeatureEnabled('isGovernanceMarkdownEnabled')"
          :text="proposalInfo ? proposalInfo.proposal.body : ''"
        />
        <p v-else>{{ proposalInfo ? proposalInfo.proposal.body : '' }}</p>
      </template>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { ProposalWithVotes } from '@/services/mover/governance';
import { isFeatureEnabled } from '@/settings';

import {
  Markdown,
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceView',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    Markdown
  },
  computed: {
    ...mapGetters('governance', {
      proposal: 'proposal',
      isLoading: 'isLoading'
    }),
    proposalInfo(): ProposalWithVotes | undefined {
      return this.proposal(this.$route.params.id);
    },
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposalInfo.proposal.title;
    }
  },
  methods: {
    isFeatureEnabled,
    handleBack(): void {
      this.$router.replace({
        name: 'governance-view-all'
      });
    }
  }
});
</script>
