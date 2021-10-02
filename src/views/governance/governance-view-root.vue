<template>
  <content-wrapper
    base-class="info__wrapper"
    has-back-button
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="governance__menu-wrapper overview__wrapper overview"
    wrapper-class="governance"
    @back="handleBack"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <template v-if="isLoading">
          <left-rail-section-nav-item-emoji-skeleton
            v-for="idx in 3"
            :key="idx"
          />
        </template>
        <template v-else>
          <left-rail-section-nav-item-emoji
            v-if="!!proposalInfo && proposalInfo.proposal.state !== 'closed'"
            :emoji="$t('governance.btnVoteFor.emoji')"
            :navigate-to="voteForPage"
            :text="$t('governance.btnVoteFor.txt')"
          />
          <left-rail-section-nav-item-emoji
            v-if="!!proposalInfo && proposalInfo.proposal.state !== 'closed'"
            :emoji="$t('governance.btnVoteAgainst.emoji')"
            :navigate-to="voteAgainstPage"
            :text="$t('governance.btnVoteAgainst.txt')"
          />
          <left-rail-section-nav-item-emoji
            :emoji="$t('governance.btnProposalAnalytics.emoji')"
            :navigate-to="analyticsPage"
            :text="$t('governance.btnProposalAnalytics.txt')"
          />
        </template>
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
  LeftRailSectionNavItemEmoji,
  LeftRailSectionNavItemEmojiSkeleton
} from '@/components/layout';
import { ProposalInfo } from '@/services/mover/governance';

import '@/styles/_overview.less';

export default Vue.extend({
  name: 'GovernanceViewRoot',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemEmoji,
    LeftRailSectionNavItemEmojiSkeleton,
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
    const governanceInfo: Array<ProposalInfo> = await this.loadGovernanceInfo();
    if (
      !governanceInfo.some((info) => info.proposal.id === this.pageProposalId)
    ) {
      await this.$router.replace({ name: 'governance-view-all' });
    }
  },
  methods: {
    ...mapActions('proposal', {
      loadGovernanceInfo: 'loadGovernanceInfo'
    }),
    handleBack(): void {
      this.$router.replace({ name: 'governance-view-all' });
    },
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
