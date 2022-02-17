<template>
  <div class="statements-list">
    <template v-if="isLoading">
      <governance-proposals-item-skeleton v-for="idx in 4" :key="idx" />
    </template>
    <template v-else>
      <governance-proposals-item
        v-for="proposal in proposals"
        :key="proposal.proposal.id"
        :item="proposal.proposal"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import GovernanceProposalsItem from './governance-proposals-item.vue';
import GovernanceProposalsItemSkeleton from './governance-proposals-item-skeleton.vue';

export default Vue.extend({
  name: 'GovernanceProposals',
  components: {
    GovernanceProposalsItem,
    GovernanceProposalsItemSkeleton
  },
  computed: {
    ...mapGetters('governance', {
      isLoading: 'isLoading',
      proposals: 'proposalsOrderedByEndingDesc'
    })
  }
});
</script>
