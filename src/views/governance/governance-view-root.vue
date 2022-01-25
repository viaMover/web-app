<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="governance__menu-wrapper overview__wrapper overview"
    wrapper-class="governance"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <navigation-section
        hide-header
        :is-loading="isLoading"
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
    </template>
    <router-view />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapActions, mapGetters, mapState } from 'vuex';

import { ProposalInfo } from '@/services/mover/governance';

import { ContentWrapper } from '@/components/layout';
import {
  NavigationSection,
  NavigationSectionItemEmoji
} from '@/components/navigation';

export default Vue.extend({
  name: 'GovernanceViewRoot',
  components: {
    NavigationSection,
    NavigationSectionItemEmoji,
    ContentWrapper
  },
  computed: {
    ...mapState('governance', {
      items: 'items',
      isLoading: 'isLoading'
    }),
    ...mapGetters('governance', {
      proposalsIds: 'proposalsIds'
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
    if (this.proposalsIds.includes(this.pageProposalId)) {
      return;
    }

    await this.$router.replace({ name: 'governance-view-all' });
  },
  methods: {
    ...mapActions('governance', {
      loadGovernanceInfo: 'loadGovernanceInfo'
    }),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
