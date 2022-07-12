<template>
  <div class="statements-list">
    <template v-if="isLoadingProposalInfoList">
      <governance-proposals-item-skeleton v-for="idx in 4" :key="idx" />
    </template>
    <template v-else>
      <governance-proposals-item
        v-for="item in proposalInfoList"
        :key="item.proposal.id"
        :item="item.proposal"
      />
    </template>
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
    ...mapState('governance', ['proposalInfoList', 'isLoadingProposalInfoList'])
  }
});
</script>
