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

    <secondary-page :title="$t('governance.lblGovernanceOverview')">
      <p>{{ $t('governance.txtGetInvolved') }}</p>

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
import { mapGetters, mapState } from 'vuex';

import { formatToDecimals, formatToNative } from '@/utils/format';

import {
  SecondaryPage,
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
    LeftRailSection,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
    GovernanceOverviewSection,
    GovernanceOverviewSectionItem
  },
  computed: {
    ...mapState('proposal', {
      proposals: 'proposalsListMinimal',
      votingPowerSelf: 'votingPowerSelf',
      communityVotingPowerRaw: 'communityVotingPower',
      powerNeededToBecomeAProposer: 'powerNeededToBecomeAProposer'
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
    },
    ...mapGetters('proposal', {
      timesVoted: 'timesVoted',
      proposalsCreated: 'proposalsCreated',
      totalNumberOfProposals: 'totalNumberOfProposals',
      openProposals: 'openProposals',
      succeededProposals: 'succeededProposals',
      defeatedProposals: 'defeatedProposals'
    })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
