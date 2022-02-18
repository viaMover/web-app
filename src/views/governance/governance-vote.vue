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
import { mapActions, mapGetters } from 'vuex';

import {
  Choice,
  Proposal,
  VoteParams,
  VoteResponse
} from '@/services/mover/governance';
import { GovernanceApiError } from '@/services/mover/governance';
import { isProviderRpcError } from '@/store/modules/governance/utils';
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
      ipfsLink: '',
      isLoading: false
    };
  },
  computed: {
    ...mapGetters('governance', {
      proposal: 'proposal',
      isStoreLoading: 'isLoading',
      isAlreadyVoted: 'isAlreadyVoted',
      alreadyVotedIpfsLink: 'ipfsLink',
      votingPowerSelfOnProposal: 'votingPowerSelfOnProposal'
    }),
    pageTitle(): string {
      if (this.proposalInfo === undefined) {
        return this.$t('governance.lblProposal') as string;
      }

      return this.proposalInfo.title;
    },
    proposalInfo(): Proposal | undefined {
      return this.proposal(this.$route.params.id)?.proposal;
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
      return formatToDecimals(
        this.votingPowerSelfOnProposal(this.proposalInfo?.id),
        0
      );
    },
    voteButtonText(): string {
      if (this.isVoteFor) {
        return this.$t('governance.btnVoteFor.txt') as string;
      }

      return this.$t('governance.btnVoteAgainst.txt') as string;
    },
    ipfsLinkText(): string {
      const alreadyVotedIpfsLink = this.alreadyVotedIpfsLink(
        this.proposalInfo?.id
      );
      if (alreadyVotedIpfsLink) {
        return this.formatIpfsLink(alreadyVotedIpfsLink);
      }

      return this.ipfsLink;
    }
  },
  watch: {
    isVoteFor: {
      handler() {
        this.errorText = '';
        this.ipfsLink = '';
        this.isLoading = false;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('governance', {
      vote: 'vote',
      loadProposalInfo: 'loadProposalInfo'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleVote(): Promise<void> {
      if (this.proposalInfo === undefined) {
        return;
      }

      this.isLoading = true;
      this.ipfsLink = '';
      this.errorText = '';

      try {
        const voteResult: VoteResponse = await this.vote({
          proposalId: this.proposalInfo.id,
          choice: this.isVoteFor ? Choice.For : Choice.Against
        } as VoteParams);

        await this.loadProposalInfo(this.proposalInfo.id);

        this.ipfsLink = this.formatIpfsLink(voteResult.ipfsHash);
      } catch (error) {
        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (
          error instanceof GovernanceApiError &&
          this.$te(`governance.errors.${error.message}`)
        ) {
          this.errorText = this.$t(
            `governance.errors.${error.message}`
          ).toString();
          return;
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
    }
  }
});
</script>
