<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtGetInvolved')"
        :title="pageTitle"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="proposalId"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblProposalId')"
      />
      <analytics-list-item
        :description="votingEndsText"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblVotingEnds')"
      />
      <analytics-list-item
        :description="proposalAuthor"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblProposer')"
      />
      <analytics-list-item
        :description="votingActivity"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblVotingActivity')"
      />
    </analytics-list>

    <analytics-list has-title :title="$t('governance.lblProposalStats')">
      <analytics-list-item
        :description="communityVotingPower"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblCommunityVotingPower')"
      />
      <analytics-list-item
        :description="votesFor"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblVotesFor')"
      />
      <analytics-list-item
        :description="votesAgainst"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblVotesAgainst')"
      />
      <analytics-list-item
        :description="currentOutcome"
        :is-loading="displayAsIsLoading"
        :title="$t('governance.lblCurrentOutcome')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { ProposalInfo } from '@/services/mover/governance';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { SecondaryPage } from '@/components/layout';
import SecondaryPageHeader from '@/components/layout/secondary-page/secondary-page-header.vue';

export default Vue.extend({
  name: 'GovernanceAnalytics',
  components: {
    SecondaryPageHeader,
    SecondaryPage,
    AnalyticsList,
    AnalyticsListItem
  },
  computed: {
    ...mapGetters('governance', {
      isLoading: 'isLoading',
      proposal: 'proposal',
      proposalCommunityVotingPower: 'proposalCommunityVotingPower',
      proposalVotedFor: 'proposalVotedFor',
      proposalVotedAgainst: 'proposalVotedAgainst',
      proposalState: 'proposalState',
      proposalVotingActivity: 'proposalVotingActivity'
    }),
    proposalId(): string {
      return this.$route.params.id;
    },
    proposalInfo(): ProposalInfo | undefined {
      return this.proposal(this.proposalId);
    },
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposalInfo.proposal.title;
    },
    proposalAuthor(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return this.proposalInfo.proposal.author;
    },
    votingEndsText(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return dayjs
        .unix(this.proposalInfo.proposal.end)
        .utc()
        .format('MMMM DD, HH:mm [UTC]');
    },
    communityVotingPower(): string {
      return formatToDecimals(
        this.proposalCommunityVotingPower(this.proposalId),
        0
      );
    },
    votingActivity(): string {
      return `${Math.ceil(this.proposalVotingActivity(this.proposalId))}%`;
    },
    votesFor(): string {
      return formatToDecimals(this.proposalVotedFor(this.proposalId), 0);
    },
    votesAgainst(): string {
      return formatToDecimals(this.proposalVotedAgainst(this.proposalId), 0);
    },
    currentOutcome(): string {
      const proposalState = this.proposalState(this.proposalId);
      if (this.$te(`governance.lblOutcome.${proposalState}`)) {
        return this.$t(`governance.lblOutcome.${proposalState}`).toString();
      }

      return this.$t('governance.lblOutcome.quorumNotReached').toString();
    },
    displayAsIsLoading(): boolean {
      return this.proposalInfo === undefined || this.isLoading;
    }
  },
  watch: {
    proposalId: {
      async handler(newVal: string | undefined): Promise<void> {
        if (newVal === undefined) {
          return;
        }

        await this.loadProposalInfo(newVal);
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('governance', {
      loadProposalInfo: 'loadProposalInfo'
    }),
    handleBack(): void {
      this.$router.replace({
        name: 'governance-view',
        params: { id: this.$route.params.id }
      });
    }
  }
});
</script>
