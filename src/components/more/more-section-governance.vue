<template>
  <more-section-base
    class="governance"
    has-expand-button
    :heading-text="$t('governance.lblGovernance')"
    :name="$t('governance.lblGovernance')"
    navigate-to-name="governance-view-all"
  >
    <div class="item-container">
      <governance-proposals-item
        v-if="!isLoadingLastProposalInfo && lastProposalInfo !== undefined"
        :item="lastProposalInfo.proposal"
      />
      <governance-proposals-item-skeleton
        v-else-if="isLoadingLastProposalInfo"
      />
    </div>

    <router-link class="button" :to="{ name: 'governance-view-all' }">
      {{ $t('governance.btnSeeAll.simple') }}
    </router-link>
  </more-section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { ProposalState } from '@/services/v2/api/mover/governance';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';

import {
  GovernanceProposalsItem,
  GovernanceProposalsItemSkeleton
} from '@/components/governance';

import MoreSectionBase from './more-section-base.vue';

export default Vue.extend({
  name: 'MoreSectionGovernance',
  components: {
    MoreSectionBase,
    GovernanceProposalsItem,
    GovernanceProposalsItemSkeleton
  },
  computed: {
    ...mapState('governance', ['isLoadingLastProposalInfo']),
    ...mapGetters('governance', ['lastProposalInfo']),
    statusText(): string {
      if (this.lastProposalInfo === undefined) {
        return '';
      }

      switch (this.lastProposalInfo.proposal.state) {
        case ProposalState.Closed:
          return this.$t('governance.lblVotingStatus.closed').toString();
        default:
          return this.$t('governance.lblVotingStatus.active').toString();
      }
    }
  },
  mounted() {
    this.loadLastProposalInfo().catch((error) => {
      addSentryBreadcrumb({
        type: 'error',
        category: 'mounted.more-section-governance.ui',
        message: 'Failed to load last propsal',
        data: { error }
      });

      captureSentryException(error);
    });
  },
  methods: {
    ...mapActions('governance', ['loadLastProposalInfo'])
  }
});
</script>
