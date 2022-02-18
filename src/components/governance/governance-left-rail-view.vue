<template>
  <nav class="left-rail navigation">
    <div class="wrapper">
      <div class="list">
        <navigation-section
          hide-header
          :is-loading="proposalInfo === undefined"
          skeleton-component="navigation-section-item-emoji-skeleton"
          :skeleton-components-count="3"
        >
          <navigation-section-item-emoji
            v-if="!!proposalInfo && proposalInfo.proposal.state !== 'closed'"
            :emoji="$t('governance.btnVoteFor.emoji')"
            :navigate-to="voteForPage"
            :text="$t('governance.btnVoteFor.txt')"
          />
          <navigation-section-item-emoji
            v-if="!!proposalInfo && proposalInfo.proposal.state !== 'closed'"
            :emoji="$t('governance.btnVoteAgainst.emoji')"
            :navigate-to="voteAgainstPage"
            :text="$t('governance.btnVoteAgainst.txt')"
          />
          <navigation-section-item-emoji
            :emoji="$t('governance.btnProposalAnalytics.emoji')"
            :navigate-to="analyticsPage"
            :text="$t('governance.btnProposalAnalytics.txt')"
          />
        </navigation-section>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapGetters } from 'vuex';

import { ProposalInfo } from '@/services/mover/governance';

import {
  NavigationSection,
  NavigationSectionItemEmoji
} from '@/components/navigation';

export default Vue.extend({
  name: 'GovernanceLeftRailView',
  components: {
    NavigationSection,
    NavigationSectionItemEmoji
  },
  computed: {
    ...mapGetters('governance', {
      proposalsIds: 'proposalsIds',
      proposal: 'proposal'
    }),
    pageProposalId(): string {
      return this.$route.params.id;
    },
    proposalInfo(): ProposalInfo | undefined {
      return this.proposal(this.pageProposalId);
    },
    voteForPage(): RawLocation {
      if (this.proposalInfo === undefined) {
        return { name: 'not-found-route' };
      }

      return {
        name: 'governance-vote',
        params: { id: this.proposalInfo.proposal.id, decision: 'for' }
      };
    },
    voteAgainstPage(): RawLocation {
      if (this.proposalInfo === undefined) {
        return { name: 'not-found-route' };
      }

      return {
        name: 'governance-vote',
        params: { id: this.proposalInfo.proposal.id, decision: 'against' }
      };
    },
    analyticsPage(): RawLocation {
      if (this.proposalInfo === undefined) {
        return { name: 'not-found-route' };
      }

      return {
        name: 'governance-analytics',
        params: { id: this.proposalInfo.proposal.id }
      };
    }
  }
});
</script>
