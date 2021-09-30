<template>
  <secondary-page :title="pageTitle">
    <p>{{ $t('governance.txtGetInvolved') }}</p>

    <template v-if="proposalInfo !== undefined">
      <governance-overview-section>
        <governance-overview-section-item
          :description="$t('governance.lblProposalId')"
          :value="proposalInfo.proposal.id"
        />
        <governance-overview-section-item
          :description="$t('governance.lblVotingEnds')"
          :value="votingEndsText"
        />
        <governance-overview-section-item
          :description="$t('governance.lblProposer')"
          :value="proposalInfo.proposal.author"
        />
        <governance-overview-section-item
          :description="$t('governance.lblVotingActivity')"
          :value="votingActivity"
        />
      </governance-overview-section>

      <governance-overview-section
        has-title
        :title="$t('governance.lblProposalStats')"
      >
        <governance-overview-section-item
          :description="$t('governance.lblCommunityVotingPower')"
          :value="communityVotingPower"
        />
        <governance-overview-section-item
          :description="$t('governance.lblVotesFor')"
          :value="votesFor"
        />
        <governance-overview-section-item
          :description="$t('governance.lblVotesAgainst')"
          :value="votesAgainst"
        />
        <governance-overview-section-item
          :description="$t('governance.lblCurrentOutcome')"
          :value="currentOutcome"
        />
      </governance-overview-section>
    </template>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import dayjs from 'dayjs';

import { ProposalInfo } from '@/services/mover/governance';
import { formatToDecimals } from '@/utils/format';

import { SecondaryPage } from '@/components/layout';
import {
  GovernanceOverviewSection,
  GovernanceOverviewSectionItem
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceAnalytics',
  components: {
    SecondaryPage,
    GovernanceOverviewSection,
    GovernanceOverviewSectionItem
  },
  computed: {
    ...mapState('proposal', {
      isLoading: 'isLoading',
      items: 'items'
    }),
    ...mapGetters('proposal', {
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
      return this.items.find(
        (proposalInfo: ProposalInfo) =>
          proposalInfo.proposal.id === this.proposalId
      );
    },
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposalInfo.proposal.title;
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
    }
  },
  watch: {
    proposalId: {
      async handler(newVal: string | undefined): Promise<void> {
        if (newVal === undefined) {
          return;
        }

        await this.loadProposal({ id: newVal });
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('proposal', {
      loadProposal: 'loadProposalInfo'
    }),
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
