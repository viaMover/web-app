<template>
  <secondary-page :title="proposal ? proposal.proposal.title : ''">
    <template v-if="isLoading" v-slot:title>
      <pu-skeleton class="title page-title" tag="h2" />
    </template>

    <div class="content">
      <markdown
        v-if="!isLoading"
        :text="proposal ? proposal.proposal.body : ''"
      />
      <pu-skeleton v-else :count="8"></pu-skeleton>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ProposalWithVotes } from '@/services/mover/governance';

import { SecondaryPage, Markdown } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceView',
  components: {
    SecondaryPage,
    Markdown
  },
  computed: {
    ...mapState('governance', {
      items: 'items',
      isLoading: 'isLoading'
    }),
    proposal(): ProposalWithVotes | undefined {
      return this.items.find(
        (item: ProposalWithVotes) => item.proposal.id === this.$route.params.id
      );
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
