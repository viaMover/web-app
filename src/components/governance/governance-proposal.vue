<template>
  <div v-if="proposal">Governance proposal</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Proposal } from '@/store/modules/proposal/types';

export default Vue.extend({
  name: 'GovernanceProposal',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('proposal', ['proposals']),
    proposal(): Proposal | null {
      return (
        (this.proposals as Array<Proposal>).find(
          (proposal) => proposal.id === this.id
        ) || null
      );
    }
  }
});
</script>
