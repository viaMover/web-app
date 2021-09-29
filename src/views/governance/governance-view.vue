<template>
  <secondary-page>
    <pu-skeleton-theme color="#dcdcdc">
      <template v-slot:title>
        <secondary-page-title v-if="isReady">{{
          proposal.proposal.title
        }}</secondary-page-title>
        <pu-skeleton v-else tag="h2" />
      </template>

      <p v-if="isReady">{{ proposal.proposal.body }}</p>
      <pu-skeleton v-else tag="p"></pu-skeleton>
    </pu-skeleton-theme>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { SecondaryPage } from '@/components/layout';
import { ProposalWithVotes } from '@/services/mover/governance';

export default Vue.extend({
  name: 'GovernanceView',
  components: {
    SecondaryPage
  },
  computed: {
    ...mapState('proposal', { items: 'items', isLoading: 'isLoading' }),
    proposal(): ProposalWithVotes | undefined {
      return this.items.find(
        (item: ProposalWithVotes) => item.proposal.id === this.$route.params.id
      );
    },
    pageTitle(): string {
      if (this.proposal !== undefined) {
        return this.proposal.proposal.title;
      }

      return this.$t('governance.lblProposal').toString();
    },
    isReady(): boolean {
      return !this.isLoading && this.proposal !== undefined;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
