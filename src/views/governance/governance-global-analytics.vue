<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <governance-nav-my-governance />
        <governance-nav-manage-governance />
      </left-rail-section>
    </template>

    <secondary-page :title="$t('governance.lblGovernance')">
      <template v-slot:title>
        <secondary-page-title :title="$t('governance.lblGovernanceOverview')" />
      </template>
      <p>{{ $t('governance.txtGovernanceOverview') }}</p>

      <governance-overview-section>
        <governance-overview-section-item
          :description="$t('governance.lblMyVotingPower')"
          :value="myVotingPower"
        />
        <governance-overview-section-item
          :description="$t('governance.lblTimesVoted')"
          :value="timesVoted"
        />
        <governance-overview-section-item
          :description="$t('governance.lblProposalsCreated')"
          :value="proposalsCreated"
        />
      </governance-overview-section>

      <governance-overview-section
        has-title
        :title="$t('governance.lblGovernanceStats')"
      >
        <governance-overview-section-item
          :description="$t('governance.lblPowerNeeded')"
          :value="powerNeeded"
        />
        <governance-overview-section-item
          :description="$t('governance.lblCommunityVotingPower')"
          :value="communityVotingPower"
        />
        <governance-overview-section-item
          :description="$t('governance.lblTotalNumberOfProposals')"
          :value="totalNumberOfProposals"
        />
        <governance-overview-section-item
          :description="$t('governance.lblOpenProposals')"
          :value="openProposals"
        />
        <governance-overview-section-item
          :description="$t('governance.lblSucceededProposals')"
          :value="succeededProposals"
        />
        <governance-overview-section-item
          :description="$t('governance.lblDefeatedProposals')"
          :value="defeatedProposals"
        />
      </governance-overview-section>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { formatToNative } from '@/utils/format';

import {
  SecondaryPage,
  SecondaryPageTitle,
  ContentWrapper,
  LeftRailSection
} from '@/components/layout';
import {
  GovernanceNavMyGovernance,
  GovernanceNavManageGovernance,
  GovernanceOverviewSection,
  GovernanceOverviewSectionItem
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceGlobalAnalytics',
  components: {
    ContentWrapper,
    SecondaryPage,
    SecondaryPageTitle,
    LeftRailSection,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
    GovernanceOverviewSection,
    GovernanceOverviewSectionItem
  },
  computed: {
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    myVotingPower(): string {
      return formatToNative('123190.24');
    },
    timesVoted(): string {
      return '2';
    },
    proposalsCreated(): string {
      return '1';
    },
    powerNeeded(): string {
      return formatToNative('100000');
    },
    communityVotingPower(): string {
      return formatToNative('123405104');
    },
    totalNumberOfProposals(): string {
      return '7';
    },
    openProposals(): string {
      return '1';
    },
    succeededProposals(): string {
      return '3';
    },
    defeatedProposals(): string {
      return '3';
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
