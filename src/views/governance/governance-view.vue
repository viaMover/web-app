<template>
  <secondary-page class="view" has-back-button hide-info @back="handleBack">
    <template v-slot:title>
      <pu-skeleton v-if="isLoading" class="title page-title" tag="h2" />
      <secondary-page-header
        v-else
        :title="proposal ? proposal.proposal.title : ''"
      />
    </template>

    <div class="content">
      <template v-if="!isLoading">
        <markdown
          v-if="isFeatureEnabled('isGovernanceMarkdownEnabled')"
          :text="proposal ? proposal.proposal.body : ''"
        />
        <p v-else>{{ proposal ? proposal.proposal.body : '' }}</p>
      </template>
      <pu-skeleton v-else :count="8" />
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ProposalWithVotes } from '@/services/mover/governance';
import { isFeatureEnabled } from '@/settings';

import {
  Markdown,
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceView',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
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
    isFeatureEnabled,
    handleBack(): void {
      this.$router.replace({
        name: 'governance-view-all'
      });
    }
  }
});
</script>
