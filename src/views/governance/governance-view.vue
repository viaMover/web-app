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
          :text="proposal ? proposal.proposal.body : ''"
        />
        <p v-else>{{ proposal ? proposal.proposal.body : '' }}</p>
      </template>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

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
    ...mapState('governance', {
      items: 'items',
      isLoading: 'isLoading'
    }),
    proposal(): ProposalWithVotes | undefined {
      return (
        this.items.find(
          (item: ProposalWithVotes) =>
            item.proposal.id === this.$route.params.id
        ) ?? undefined
      );
    },
    pageTitle(): string {
      if (this.proposal === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposal.proposal.title;
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
