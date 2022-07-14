<template>
  <secondary-page class="vote" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="explanatoryText"
        :title="pageTitle"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="myVotingPower"
        :is-loading="isStoreLoading"
        :title="$t('governance.lblMyVotingPower')"
      />
      <analytics-list-item
        v-if="ipfsLinkText"
        :is-loading="isLoading"
        :title="$t('governance.lblIpfsLink')"
      >
        <a
          class="link underline muted medium"
          :href="ipfsLinkText"
          rel="external nofollow"
          target="_blank"
        >
          {{ $t('governance.txtIpfsLink') }}
        </a>
      </analytics-list-item>
    </analytics-list>

    <div class="actions">
      <div class="group default">
        <action-button
          class="primary"
          :disabled="isLoading || isStoreLoading"
          @button-click="handleVote"
        >
          <div v-if="isLoading" class="loader-icon">
            <img
              :alt="$t('icon.txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
          </div>
          <template v-else>
            {{ voteButtonText }}
          </template>
        </action-button>
      </div>
      <div v-if="errorText" class="group error-message">{{ errorText }}</div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { MoverAPIError } from '@/services/v2/api/mover';
import {
  Choice,
  ProposalInfo,
  VoteResponse
} from '@/services/v2/api/mover/governance';
import { ErrorCode } from '@/services/v2/api/mover/governance/types';
import { isProviderRpcError } from '@/services/v2/on-chain';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import { VoteParams } from '@/store/modules/governance/types';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceVote',
  components: {
    AnalyticsList,
    AnalyticsListItem,
    SecondaryPage,
    SecondaryPageHeader,
    ActionButton
  },
  data() {
    return {
      errorText: '',
      isLoading: false,
      isLoadingProposal: false,
      proposalInfo: undefined as ProposalInfo | undefined
    };
  },
  computed: {
    ...mapState('governance', ['proposalInfoList']),
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal') as string;
      }

      return this.proposalInfo.proposal.title;
    },
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    isVoteFor(): boolean {
      return this.$route.params.decision === 'for';
    },
    explanatoryText(): string {
      if (this.isVoteFor) {
        return this.$t('governance.txtVoteFor') as string;
      }

      return this.$t('governance.txtVoteAgainst') as string;
    },
    myVotingPower(): string {
      return formatToDecimals(this.proposalInfo?.voteInfo.votingPower ?? 0, 0);
    },
    voteButtonText(): string {
      if (this.isVoteFor) {
        return this.$t('governance.btnVoteFor.txt') as string;
      }

      return this.$t('governance.btnVoteAgainst.txt') as string;
    },
    ipfsLinkText(): string {
      const link = this.proposalInfo?.voteInfo.ipfsHash;
      if (link === undefined) {
        return '';
      }

      return this.formatIpfsLink(link);
    }
  },
  watch: {
    isVoteFor: {
      handler() {
        this.errorText = '';
        this.isLoading = false;
      },
      immediate: true
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
          this.isLoadingProposal = true;
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
          this.isLoadingProposal = false;
        }
      },
      { immediate: true }
    );
  },
  methods: {
    ...mapActions('governance', ['loadProposalInfoById', 'vote']),
    handleClose(): void {
      this.$router.back();
    },
    async handleVote(): Promise<void> {
      if (this.proposalInfo === undefined) {
        return;
      }

      this.isLoading = true;
      this.errorText = '';

      try {
        const voteResult: VoteResponse = await this.vote({
          proposalId: this.proposalInfo.proposal.id,
          choice: this.isVoteFor ? Choice.For : Choice.Against
        } as VoteParams);

        await this.loadNewProposalInfo(voteResult.id);
      } catch (error) {
        if (
          error instanceof MoverAPIError &&
          [
            ErrorCode.InsufficientVotingPower,
            ErrorCode.AlreadyVoted,
            ErrorCode.ProposalNotActive
          ].includes(error.shortMessage as ErrorCode)
        ) {
          // won't emit error to Sentry, write a warning
          addSentryBreadcrumb({
            type: 'warning',
            category: 'handleSubmit.governance-create-proposal.ui',
            message: 'Failed to create a proposal. Server validation failed',
            data: {
              error
            }
          });
        } else {
          captureSentryException(error);
        }

        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (error instanceof MoverAPIError) {
          if (this.$te(`governance.errors.${error.message}`)) {
            this.errorText = this.$t(
              `governance.errors.${error.message}`
            ) as string;
            return;
          }

          if (this.$te(`governance.errors.${error.shortMessage}`)) {
            this.errorText = this.$t(
              `governance.errors.${error.shortMessage}`
            ) as string;
            return;
          }
        }

        this.errorText = this.$t('governance.errors.default').toString();
      } finally {
        this.isLoading = false;
      }
    },
    formatIpfsLink(path: string): string {
      return `https://gateway.ipfs.io/ipfs/${path}`;
    },
    handleBack(): void {
      this.$router.replace({
        name: 'governance-view',
        params: { id: this.$route.params.id }
      });
    },
    async loadNewProposalInfo(id: string): Promise<void> {
      try {
        this.isLoadingProposal = true;
        this.proposalInfo = await this.loadProposalInfoById(id);
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'loadNewProposalInfo.governance-vote.ui',
          message: 'Failed to obtain / get proposal info by id',
          data: { error, id }
        });
        captureSentryException(error);
      } finally {
        this.isLoadingProposal = false;
      }
    }
  }
});
</script>
