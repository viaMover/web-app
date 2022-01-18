<template>
  <section-base
    container-class="more__wrapper__menu-item governance"
    has-expand-button
    :heading-text="$t('governance.lblGovernance')"
    :name="$t('governance.lblGovernance')"
    navigate-to-name="governance-view-all"
  >
    <governance-proposals-item
      v-if="!isLoading && lastProposal !== undefined"
      class="no-border no-padding"
      :item="lastProposal"
    />
    <governance-proposals-item-skeleton
      v-else-if="isLoading"
      class="no-border no-padding"
      :number="1"
    />

    <router-link
      class="link button-active"
      :to="{ name: 'governance-view-all' }"
    >
      {{ $t('governance.btnSeeAll.simple') }}
    </router-link>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { Proposal } from '@/services/mover/governance';

import {
  GovernanceProposalsItem,
  GovernanceProposalsItemSkeleton
} from '@/components/governance';

import SectionBase from './section-base/section-base.vue';

export default Vue.extend({
  name: 'GovernanceSection',
  components: {
    SectionBase,
    GovernanceProposalsItem,
    GovernanceProposalsItemSkeleton
  },
  computed: {
    ...mapState('governance', {
      isGovernanceModuleLoading: 'isLoading',
      isLoadingLastProposal: 'isLoadingLastProposal'
    }),
    ...mapGetters('governance', {
      lastProposalRaw: 'lastProposal'
    }),
    lastProposal(): Proposal | undefined {
      return this.lastProposalRaw?.proposal;
    },
    isLoading(): boolean {
      return this.isGovernanceModuleLoading || this.isLoadingLastProposal;
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
    await this.loadMinimalGovernanceInfo();
  },
  methods: {
    ...mapActions('governance', {
      loadMinimalGovernanceInfo: 'loadMinimalGovernanceInfo'
    })
  }
});
</script>
