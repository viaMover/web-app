<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtGetInvolved')"
        :title="$t('governance.lblGovernanceOverview')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="myVotingPower"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblMyVotingPower')"
      />
      <analytics-list-item
        :description="timesVoted"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblTimesVoted')"
      />
      <analytics-list-item
        :description="proposalsCreated"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblProposalsCreated')"
      />
    </analytics-list>

    <analytics-list has-title :title="$t('governance.lblGovernanceStats')">
      <analytics-list-item
        :description="powerNeeded"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblPowerNeeded')"
      />
      <analytics-list-item
        :description="communityVotingPower"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblCommunityVotingPower')"
      />
      <analytics-list-item
        :description="totalNumberOfProposals"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblTotalNumberOfProposals')"
      />
      <analytics-list-item
        :description="openProposals"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblOpenProposals')"
      />
      <analytics-list-item
        :description="succeededProposals"
        :is-loading="isLoadingProposalInfoList"
        :title="$t('governance.lblSucceededProposals')"
      />
      <analytics-list-item
        :description="defeatedProposals"
        :is-loading="isLoadingProposalInfoList"
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
    ...mapState('governance', [
      'currentVotingInfo',
      'isLoadingProposalInfoList'
    ]),
    ...mapGetters('governance', [
      'timesVoted',
      'proposalsCreated',
      'totalNumberOfProposals',
      'openProposals',
      'succeededProposals',
      'defeatedProposals'
    ]),
    myVotingPower(): string {
      return formatToDecimals(this.currentVotingInfo.votingPower, 0);
    },
    communityVotingPower(): string {
      return formatToDecimals(this.currentVotingInfo.communityVotingPower, 0);
    },
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    powerNeeded(): string {
      return formatToDecimals(this.currentVotingInfo.minimalVotingPower, 0);
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
