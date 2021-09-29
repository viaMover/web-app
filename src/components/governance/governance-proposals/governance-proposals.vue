<template>
  <div class="container">
    <div v-if="!isLoading">
      <governance-proposals-item
        v-for="proposal in proposals"
        :key="proposal.proposal.id"
        :item="proposal.proposal"
      />
    </div>
    <governance-proposals-item-skeleton v-else :number="4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import GovernanceProposalsItem from './governance-proposals-item.vue';
import GovernanceProposalsItemSkeleton from './governance-proposals-item-skeleton.vue';

export default Vue.extend({
  name: 'GovernanceProposals',
  components: {
    GovernanceProposalsItem,
    GovernanceProposalsItemSkeleton
  },
  computed: {
    ...mapState('proposal', {
      proposals: 'items',
      isLoading: 'isLoading'
    })
  }
});
</script>
