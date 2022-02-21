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
        v-if="!isLoading && lastProposal !== undefined"
        :item="lastProposal"
      />
      <governance-proposals-item-skeleton v-else-if="isLoading" />
    </div>

    <router-link class="button" :to="{ name: 'governance-view-all' }">
      {{ $t('governance.btnSeeAll.simple') }}
    </router-link>
  </more-section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import { Proposal } from '@/services/mover/governance';

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
    ...mapGetters('governance', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('governance', {
      lastProposalRaw: 'lastProposal'
    }),
    lastProposal(): Proposal | undefined {
      return this.lastProposalRaw?.proposal;
    },
    statusText(): string {
      if (this.lastProposal === undefined) {
        return '';
      }

      switch ((this.lastProposal as Proposal).state) {
        case 'closed':
          return this.$t('governance.lblVotingStatus.closed').toString();
        default:
          return this.$t('governance.lblVotingStatus.active').toString();
      }
    }
  },
  async mounted() {
    await this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('governance', {
      loadMinimalInfo: 'loadMinimalInfo'
    })
  }
});
</script>
