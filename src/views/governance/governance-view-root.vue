<template>
  <content-wrapper
    has-back-button
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <left-rail-section-nav-item-emoji
          :emoji="$t('governance.btnVoteFor.emoji')"
          :navigate-to="voteForPage"
          :text="$t('governance.btnVoteFor.txt')"
        />
        <left-rail-section-nav-item-emoji
          :emoji="$t('governance.btnVoteAgainst.emoji')"
          :navigate-to="voteAgainstPage"
          :text="$t('governance.btnVoteAgainst.txt')"
        />
        <left-rail-section-nav-item-emoji
          :emoji="$t('governance.btnProposalAnalytics.emoji')"
          :navigate-to="analyticsPage"
          :text="$t('governance.btnProposalAnalytics.txt')"
        />
      </left-rail-section>
    </template>
    <router-view />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { RawLocation } from 'vue-router';

import {
  ContentWrapper,
  LeftRailSection,
  LeftRailSectionNavItemEmoji
} from '@/components/layout';
import { ProposalInfo } from '@/services/mover/governance';

export default Vue.extend({
  name: 'GovernanceViewRoot',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemEmoji,
    ContentWrapper
  },
  computed: {
    ...mapState('proposal', {
      items: 'items',
      isLoading: 'isLoading'
    }),
    pageProposalId(): string {
      return this.$route.params.id;
    },
    proposalInfo(): ProposalInfo | undefined {
      return this.items.find(
        (proposal: ProposalInfo) => proposal.proposal.id === this.pageProposalId
      );
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
  },
  async mounted() {
    await this.loadGovernanceInfo();
    if (this.proposalInfo === undefined) {
      // this.$router.replace({ name: 'not-found-route' });
      console.debug('should be redirected to 404');
    }
  },
  methods: {
    ...mapActions('proposal', {
      loadGovernanceInfo: 'loadGovernanceInfo'
    }),
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
