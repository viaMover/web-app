<template>
  <nav class="left-rail navigation">
    <div class="wrapper">
      <div class="list">
        <navigation-section
          hide-header
          :is-loading="proposalInfo === undefined || isLoading"
          skeleton-component="navigation-section-item-emoji-skeleton"
          :skeleton-components-count="3"
        >
          <navigation-section-item-emoji
            v-if="showVotePageLinks"
            :emoji="$t('governance.btnVoteFor.emoji')"
            :navigate-to="voteForPage"
            :text="$t('governance.btnVoteFor.txt')"
          />
          <navigation-section-item-emoji
            v-if="showVotePageLinks"
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
import { mapActions, mapState } from 'vuex';

import {
  ProposalInfo,
  ProposalState
} from '@/services/v2/api/mover/governance';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';

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
  data() {
    return {
      proposalInfo: undefined as ProposalInfo | undefined,
      isLoading: false
    };
  },
  computed: {
    ...mapState('governance', ['proposalInfoList']),
    showVotePageLinks(): boolean {
      return this.proposalInfo?.proposal.state === ProposalState.Active;
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
  mounted() {
    this.$watch(
      () => this.$route.params.id,
      async (newVal: string | undefined) => {
        if (newVal === undefined) {
          return;
        }

        try {
          this.isLoading = true;
          const data = (this.proposalInfoList as Array<ProposalInfo>).find(
            (item) => item.proposal.id === newVal
          );
          if (data === undefined) {
            this.proposalInfo = await this.loadProposalInfoById(newVal);
          } else {
            this.proposalInfo = data;
          }
        } catch (error) {
          addSentryBreadcrumb({
            type: 'error',
            category: 'id.$watch.governance-analytics.ui',
            message: 'Failed to obtain / get proposal info by id',
            data: { error, newVal }
          });
          captureSentryException(error);
        } finally {
          this.isLoading = false;
        }
      },
      { immediate: true }
    );
  },
  methods: {
    ...mapActions('governance', ['loadProposalInfoById'])
  }
});
</script>
