<template>
  <secondary-page
    class="analytics"
    has-back-button
    hide-info
    @back="handleBack"
  >
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtGetInvolved')"
        :title="$t('governance.lblGovernanceOverview')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="myVotingPower"
        :is-loading="isLoading"
        :title="$t('governance.lblMyVotingPower')"
      />
      <analytics-list-item
        :description="timesVoted"
        :is-loading="isLoading"
        :title="$t('governance.lblTimesVoted')"
      />
      <analytics-list-item
        :description="proposalsCreated"
        :is-loading="isLoading"
        :title="$t('governance.lblProposalsCreated')"
      />
    </analytics-list>

    <analytics-list has-title :title="$t('governance.lblGovernanceStats')">
      <analytics-list-item
        :description="powerNeeded"
        :is-loading="isLoading"
        :title="$t('governance.lblPowerNeeded')"
      />
      <analytics-list-item
        :description="communityVotingPower"
        :is-loading="isLoading"
        :title="$t('governance.lblCommunityVotingPower')"
      />
      <analytics-list-item
        :description="totalNumberOfProposals"
        :is-loading="isLoading"
        :title="$t('governance.lblTotalNumberOfProposals')"
      />
      <analytics-list-item
        :description="openProposals"
        :is-loading="isLoading"
        :title="$t('governance.lblOpenProposals')"
      />
      <analytics-list-item
        :description="succeededProposals"
        :is-loading="isLoading"
        :title="$t('governance.lblSucceededProposals')"
      />
      <analytics-list-item
        :description="defeatedProposals"
        :is-loading="isLoading"
        :title="$t('governance.lblDefeatedProposals')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceGlobalAnalytics',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsList,
    AnalyticsListItem
  },
  computed: {
    ...mapGetters('governance', {
      isLoading: 'isLoading',
      votingPowerSelf: 'votingPowerSelf',
      communityVotingPowerRaw: 'communityVotingPower'
    }),
    ...mapState('governance', {
      powerNeededToBecomeAProposer: 'powerNeededToBecomeAProposer'
    }),
    ...mapGetters('governance', {
      timesVoted: 'timesVoted',
      proposalsCreated: 'proposalsCreated',
      totalNumberOfProposals: 'totalNumberOfProposals',
      openProposals: 'openProposals',
      succeededProposals: 'succeededProposals',
      defeatedProposals: 'defeatedProposals'
    }),
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    myVotingPower(): string {
      return formatToDecimals(this.votingPowerSelf, 0);
    },
    powerNeeded(): string {
      return formatToDecimals(this.powerNeededToBecomeAProposer, 0);
    },
    communityVotingPower(): string {
      return formatToDecimals(this.communityVotingPowerRaw, 0);
    }
  },
  methods: {
    handleBack(): void {
      this.$router.replace({ name: 'governance-view-all' });
    },
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
