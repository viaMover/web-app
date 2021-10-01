<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <governance-nav-my-governance />
        <governance-nav-manage-governance />
      </left-rail-section>
    </template>

    <secondary-page :title="$t('governance.lblCreateAProposal')">
      <p class="description">{{ $t('governance.txtCreateAProposal') }}</p>
      <div class="column">
        <div class="item">
          <span>{{ daysToRun }}</span>
          <p>{{ $t('governance.lblDaysToRun') }}</p>
        </div>
      </div>
      <div class="column">
        <div class="item">
          <span>{{ minimumVotingThresholdText }}</span>
          <p>{{ $t('governance.lblMinimumVotingThreshold') }}</p>
        </div>
      </div>

      <p class="text">{{ $t('governance.txtCreateAProposalTip') }}</p>

      <div class="statements">
        <form @submit.prevent="handleSubmit">
          <label>
            {{ $t('governance.lblProposalTitle') }}
            <input
              v-model="proposalTemplate.title"
              :name="$t('governance.lblProposalTitle')"
              :placeholder="$t('governance.txtProposalTitlePlaceholder')"
              type="text"
            />
          </label>
          <label>
            {{ $t('governance.lblProposalDescription') }}
            <textarea
              v-model="proposalTemplate.description"
              :placeholder="$t('governance.txtProposalDescriptionPlaceholder')"
            />
          </label>
          <button class="black-link button-active" type="submit">
            {{ $t('governance.lblCreateAProposal') }}
          </button>
          <p v-if="errorText" class="error">
            {{ errorText }}
          </p>
        </form>
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { formatToDecimals } from '@/utils/format';
import { CreateProposalPayload } from '@/store/modules/proposal/types';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/proposal/utils';
import { GovernanceApiError } from '@/services/mover/governance';

import {
  SecondaryPage,
  ContentWrapper,
  LeftRailSection
} from '@/components/layout';
import {
  GovernanceNavMyGovernance,
  GovernanceNavManageGovernance
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceCreateProposal',
  components: {
    SecondaryPage,
    ContentWrapper,
    LeftRailSection,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance
  },
  data() {
    return {
      proposalTemplate: {
        title: '',
        description: ''
      },
      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('proposal', {
      daysToRun: 'proposalDurationDays'
    }),
    ...mapGetters('proposal', {
      minimumVotingThreshold: 'minimumVotingThreshold'
    }),
    minimumVotingThresholdText(): string {
      return formatToDecimals(this.minimumVotingThreshold, 0);
    },
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    isCreateProposalAvailable(): boolean {
      return true;
    }
  },
  methods: {
    ...mapActions('proposal', {
      createProposal: 'createProposal'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleSubmit(): Promise<void> {
      this.errorText = '';
      this.isLoading = true;

      try {
        await this.createProposal({
          title: this.proposalTemplate.title,
          description: this.proposalTemplate.description
        } as CreateProposalPayload);

        this.proposalTemplate = { title: '', description: '' };

        await this.$router.replace({
          name: 'governance-view',
          params: {
            id: '222'
          }
        });

        this.isLoading = false;
      } catch (error) {
        if (isProviderRpcError(error)) {
          const providerError = error as ProviderRpcError;

          if (this.$te(`provider.errors.${providerError.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${providerError.code}`
            ).toString();
          }
          this.isLoading = false;
          return;
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
