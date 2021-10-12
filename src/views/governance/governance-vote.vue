<template>
  <secondary-page :title="pageTitle">
    <p class="description">{{ explanatoryText }}</p>

    <governance-overview-section-skeleton v-if="isProposalLoading">
      <governance-overview-section-item-skeleton />
    </governance-overview-section-skeleton>
    <governance-overview-section v-else>
      <governance-overview-section-item
        :description="$t('governance.lblMyVotingPower')"
        :value="myVotingPower"
      />
    </governance-overview-section>

    <button
      class="black-link button-active"
      :class="{ disabled: isLoading || isProposalLoading }"
      :disabled="isLoading || isProposalLoading"
      type="button"
      @click="handleVote"
    >
      {{ voteButtonText }}
    </button>
    <p v-if="ipfsLink" class="description">
      {{ $t('governance.ipfsLink') }}
      &nbsp;
      <a class="ipfs-link" :href="ipfsLink" target="_blank">
        {{ ipfsLink }}
      </a>
    </p>
    <p v-if="errorText" class="error">
      {{ errorText }}
    </p>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import {
  Choice,
  Proposal,
  ProposalInfo,
  VoteParams,
  VoteResponse
} from '@/services/mover/governance';
import { GovernanceApiError } from '@/services/mover/governance';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/governance/utils';
import { formatToDecimals, formatToNative } from '@/utils/format';

import {
  GovernanceOverviewSection,
  GovernanceOverviewSectionItem,
  GovernanceOverviewSectionItemSkeleton,
  GovernanceOverviewSectionSkeleton
} from '@/components/governance';
import { SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceVote',
  components: {
    SecondaryPage,
    GovernanceOverviewSection,
    GovernanceOverviewSectionSkeleton,
    GovernanceOverviewSectionItem,
    GovernanceOverviewSectionItemSkeleton
  },
  data() {
    return {
      errorText: '',
      ipfsLink: '',
      isLoading: false
    };
  },
  computed: {
    ...mapState('governance', {
      isProposalLoading: 'isLoading',
      votingPowerSelf: 'votingPowerSelf',
      proposals: 'items'
    }),
    pageTitle(): string {
      if (this.proposal === undefined) {
        return this.$t('governance.lblProposal').toString();
      }

      return this.proposal.title;
    },
    proposal(): Proposal | undefined {
      return (this.proposals as Array<ProposalInfo>).find(
        (item) => item.proposal.id === this.$route.params.id
      )?.proposal;
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
      return formatToDecimals(this.votingPowerSelf, 0);
    },
    voteButtonText(): string {
      if (this.isVoteFor) {
        return this.$t('governance.btnVoteFor.txt') as string;
      }

      return this.$t('governance.btnVoteAgainst.txt') as string;
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
      if (this.proposal === undefined) {
        return;
      }

      this.isLoading = true;
      this.ipfsLink = '';
      this.errorText = '';

      try {
        const voteResult: VoteResponse = await this.vote({
          proposal: this.proposal.id,
          choice: this.isVoteFor ? Choice.For : Choice.Against
        } as VoteParams);

        await this.loadProposalInfo({
          id: voteResult?.id ?? this.proposal.id,
          refetch: true
        });

        this.ipfsLink = this.formatIpfsLink(voteResult.ipfsHash);
        this.isLoading = false;
      } catch (error) {
        if (isProviderRpcError(error)) {
          const providerError = error as ProviderRpcError;

          if (this.$te(`provider.errors.${providerError.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${providerError.code}`
            ).toString();
            this.isLoading = false;
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
          this.isLoading = false;
          return;
        }

        this.errorText = this.$t('governance.errors.default').toString();
        this.isLoading = false;
      }
    },
    formatIpfsLink(path: string): string {
      return `https://gateway.ipfs.io/ipfs/${path}`;
    }
  }
});
</script>
