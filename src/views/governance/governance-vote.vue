<template>
  <secondary-page :title="proposal ? proposal.title : ''">
    <p class="description">{{ explanatoryText }}</p>
    <governance-overview-section>
      <governance-overview-section-item
        :description="$t('governance.lblMyVotingPower')"
        :value="myVotingPower"
      />
    </governance-overview-section>
    <button
      class="black-link button-active"
      :class="{ disabled: isLoading }"
      :disabled="isLoading"
      type="button"
      @click="handleVote"
    >
      {{ voteButtonText }}
    </button>
    <p v-if="errorText" class="error">
      {{ errorText }}
    </p>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { formatToNative } from '@/utils/format';

import {
  Choice,
  Proposal,
  ProposalInfo,
  VoteParams
} from '@/services/mover/governance';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/proposal/utils';
import { GovernanceApiError } from '@/services/mover/governance';

import { SecondaryPage } from '@/components/layout';
import {
  GovernanceOverviewSection,
  GovernanceOverviewSectionItem
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceVote',
  components: {
    SecondaryPage,
    GovernanceOverviewSection,
    GovernanceOverviewSectionItem
  },
  data() {
    return {
      errorText: '',
      isLoading: false
    };
  },
  computed: {
    ...mapState('proposal', {
      proposals: 'items'
    }),
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
      return formatToNative('123190.24');
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
        this.isLoading = false;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('proposal', {
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

      try {
        await this.vote({
          proposal: this.proposal.id,
          choice: this.isVoteFor ? Choice.For : Choice.Against
        } as VoteParams);

        await this.loadProposalInfo({ id: this.proposal.id, refetch: true });

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
    }
  }
});
</script>
