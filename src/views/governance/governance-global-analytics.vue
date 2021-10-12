<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="overview__wrapper governance-overview__menu-wrapper"
    wrapper-class="governance-overview"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <div class="progressive-left-rail">
        <governance-nav-my-governance />
        <governance-nav-manage-governance />
      </div>
    </template>

    <secondary-page
      has-back-button
      :title="$t('governance.lblGovernanceOverview')"
      @back="handleBack"
    >
      <p class="description">{{ $t('governance.txtGetInvolved') }}</p>

      <template v-if="isLoading">
        <governance-overview-section-skeleton>
          <governance-overview-section-item-skeleton
            v-for="idx in 3"
            :key="idx"
          />
        </governance-overview-section-skeleton>

        <governance-overview-section-skeleton has-title>
          <governance-overview-section-item-skeleton
            v-for="idx in 6"
            :key="idx"
          />
        </governance-overview-section-skeleton>
      </template>
      <template v-else>
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
      </template>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatToDecimals } from '@/utils/format';

import {
  GovernanceNavManageGovernance,
  GovernanceNavMyGovernance,
  GovernanceOverviewSection,
  GovernanceOverviewSectionItem,
  GovernanceOverviewSectionItemSkeleton,
  GovernanceOverviewSectionSkeleton
} from '@/components/governance';
import { ContentWrapper, SecondaryPage } from '@/components/layout';

import '@/styles/_overview.less';

export default Vue.extend({
  name: 'GovernanceGlobalAnalytics',
  components: {
    ContentWrapper,
    SecondaryPage,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
    GovernanceOverviewSection,
    GovernanceOverviewSectionSkeleton,
    GovernanceOverviewSectionItem,
    GovernanceOverviewSectionItemSkeleton
  },
  computed: {
    ...mapState('governance', {
      isLoading: 'isLoading',
      votingPowerSelf: 'votingPowerSelf',
      communityVotingPowerRaw: 'communityVotingPower',
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
