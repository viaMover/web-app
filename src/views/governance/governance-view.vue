<template>
  <secondary-page class="view" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header :title="pageTitle" />
    </template>

    <div class="text">
      <div v-if="proposalInfo === undefined || isLoading" class="skeleton-text">
        <pu-skeleton v-for="idx in 8" :key="idx" tag="p" />
      </div>
      <template v-else>
        <markdown
          v-if="isGovernanceMarkdownEnabled"
          :text="proposalInfo ? proposalInfo.proposal.body : ''"
        />
        <p v-else>{{ proposalInfo ? proposalInfo.proposal.body : '' }}</p>
      </template>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { ProposalInfo } from '@/services/v2/api/mover/governance';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
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
  data() {
    return {
      isLoading: false,
      proposalInfo: undefined as ProposalInfo | undefined
    };
  },
  computed: {
    ...mapState('governance', ['proposalInfoList']),
    isGovernanceMarkdownEnabled(): boolean {
      return isFeatureEnabled(
        'isGovernanceMarkdownEnabled',
        this.currentNetwork
      );
    },
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposalInfo.proposal.title;
    }
  },
  mounted() {
    this.$watch(
      () => this.$route.params.id,
      async (newVal: string | undefined) => {
        if (newVal === undefined) {
          return;
        }

        try {
          this.isLoading = true;
          const data = (this.proposalInfoList as Array<ProposalInfo>).find(
            (item) => item.proposal.id === newVal
          );
          if (data === undefined) {
            this.proposalInfo = await this.loadProposalInfoById(newVal);
          } else {
            this.proposalInfo = data;
          }
        } catch (error) {
          addSentryBreadcrumb({
            type: 'error',
            category: 'id.$watch.governance-view.ui',
            message: 'Failed to obtain / get proposal info by id',
            data: { error, newVal }
          });
          captureSentryException(error);
        } finally {
          this.isLoading = false;
        }
      },
      { immediate: true }
    );
  },
  methods: {
    ...mapActions('governance', ['loadProposalInfoById']),
    handleBack(): void {
      this.$router.replace({
        name: 'governance-view-all'
      });
    }
  }
});
</script>
