<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtGetInvolved')"
        :title="pageTitle"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="proposalId"
        :is-loading="isLoading"
        :title="$t('governance.lblProposalId')"
      />
      <analytics-list-item
        :description="votingEndsText"
        :is-loading="isLoading"
        :title="$t('governance.lblVotingEnds')"
      />
      <analytics-list-item
        :description="proposalAuthor"
        :is-loading="isLoading"
        :title="$t('governance.lblProposer')"
      />
      <analytics-list-item
        :description="votingActivity"
        :is-loading="isLoading"
        :title="$t('governance.lblVotingActivity')"
      />
    </analytics-list>

    <analytics-list has-title :title="$t('governance.lblProposalStats')">
      <analytics-list-item
        :description="communityVotingPower"
        :is-loading="isLoading"
        :title="$t('governance.lblCommunityVotingPower')"
      />
      <analytics-list-item
        :description="votesFor"
        :is-loading="isLoading"
        :title="$t('governance.lblVotesFor')"
      />
      <analytics-list-item
        :description="votesAgainst"
        :is-loading="isLoading"
        :title="$t('governance.lblVotesAgainst')"
      />
      <analytics-list-item
        :description="currentOutcome"
        :is-loading="isLoading"
        :title="$t('governance.lblCurrentOutcome')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import dayjs from 'dayjs';

import { ProposalInfo } from '@/services/v2/api/mover/governance';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { SecondaryPage } from '@/components/layout';
import SecondaryPageHeader from '@/components/layout/secondary-page/secondary-page-header.vue';

export default Vue.extend({
  name: 'GovernanceAnalytics',
  components: {
    SecondaryPageHeader,
    SecondaryPage,
    AnalyticsList,
    AnalyticsListItem
  },
  data() {
    return {
      isLoading: false,
      proposalInfo: undefined as ProposalInfo | undefined
    };
  },
  computed: {
    ...mapState('governance', ['proposalInfoList']),
    proposalId(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return this.proposalInfo.proposal.id;
    },
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal') as string;
      }

      return this.proposalInfo.proposal.title;
    },
    proposalAuthor(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return this.proposalInfo.proposal.author;
    },
    votingEndsText(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return dayjs
        .unix(this.proposalInfo.proposal.endTs)
        .utc()
        .format('MMMM DD, HH:mm [UTC]');
    },
    communityVotingPower(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return formatToDecimals(
        this.proposalInfo.proposal.communityVotingPower,
        0
      );
    },
    votingActivity(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return `${Math.ceil(this.proposalInfo.proposal.votingActivity)}%`;
    },
    votesFor(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return formatToDecimals(this.proposalInfo.stats.for, 0);
    },
    votesAgainst(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      return formatToDecimals(this.proposalInfo.stats.against, 0);
    },
    currentOutcome(): string {
      if (this.proposalInfo === undefined) {
        return '';
      }

      const status = this.proposalInfo.proposal.status;

      if (this.$te(`governance.lblOutcome.${status}`)) {
        return this.$t(`governance.lblOutcome.${status}`) as string;
      }

      return status;
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
            category: 'id.$watch.governance-analytics.ui',
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
        name: 'governance-view',
        params: { id: this.$route.params.id }
      });
    }
  }
});
</script>
