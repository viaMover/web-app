<template>
  <secondary-page class="create-a-proposal" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtCreateAProposal')"
        :title="$t('governance.lblCreateAProposal')"
      />
    </template>

    <product-info-wrapper>
      <product-info-item
        :description="$t('governance.lblDaysToRun')"
        :title="daysToRun"
      />
      <product-info-item
        :description="$t('governance.lblMinimumVotingThreshold')"
        :title="minimumVotingThresholdText"
      />
    </product-info-wrapper>

    <div class="tip">{{ $t('governance.txtCreateAProposalTip') }}</div>

    <form
      class="form create-a-proposal"
      :class="{ error: $v.proposalTemplate.$error || !!errorText }"
      @submit.prevent="handleSubmit"
    >
      <div class="input-group">
        <label>
          {{ $t('governance.lblProposalTitle') }}
          <input
            v-model="proposalTemplate.title"
            autocomplete="off"
            autofocus
            :name="$t('governance.lblProposalTitle')"
            :placeholder="$t('governance.txtProposalTitlePlaceholder')"
            tabindex="1"
            type="text"
          />
        </label>
        <span v-if="!$v.proposalTemplate.title.required" class="error-message">
          {{ $t('governance.createProposal.validations.title.required') }}
        </span>
        <span
          v-if="!$v.proposalTemplate.title.maxLength"
          class="error-message"
          tabindex="2"
        >
          {{
            $t('governance.createProposal.validations.title.maxLength', {
              boundary: $v.proposalTemplate.title.$params.maxLength
            })
          }}
        </span>
      </div>
      <div class="input-group">
        <label>
          {{ $t('governance.lblProposalDescription') }}
          <span
            v-if="isGovernanceMarkdownEnabled"
            class="toggle-preview"
            :title="$t('governance.txtTogglePreview')"
            @click.prevent.stop="togglePreview"
          >
            {{ $t('governance.btnTogglePreview') }}
          </span>
          <textarea
            v-if="!isPreviewEnabled"
            ref="textarea"
            v-model="proposalTemplate.description"
            autocomplete="off"
            class="no-resize"
            :placeholder="$t('governance.txtProposalDescriptionPlaceholder')"
            tabindex="2"
            @blur="resizeTextArea"
            @drop="resizeTextArea"
            @focus="resizeTextArea"
            @input.passive="resizeTextArea"
            @paste="resizeTextArea"
          />
          <markdown v-else :text="proposalTemplate.description" />
        </label>
        <span
          v-if="!$v.proposalTemplate.description.required"
          class="error-message"
        >
          {{ $t('governance.createProposal.validations.description.required') }}
        </span>
        <span
          v-if="!$v.proposalTemplate.description.maxLength"
          class="error-message"
        >
          {{
            $t('governance.createProposal.validations.description.maxLength', {
              boundary: $v.proposalTemplate.description.$params.maxLength
            })
          }}
        </span>
      </div>
      <action-button
        class="primary"
        :disabled="isLoading"
        propagate-original-event
        tabindex="4"
        type="submit"
      >
        <div v-if="isLoading" class="loader-icon">
          <img
            :alt="$t('icon.txtPendingIconAlt')"
            src="@/assets/images/ios-spinner-white.svg"
          />
        </div>
        <template v-else>
          {{ $t('governance.lblCreateAProposal') }}
        </template>
      </action-button>
      <span class="error-message">
        {{ errorText }}
      </span>
    </form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { maxLength, required } from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

import { MoverAPIError } from '@/services/v2/api/mover';
import {
  CreateProposalParams,
  CreateProposalResponse
} from '@/services/v2/api/mover/governance';
import { ErrorCode } from '@/services/v2/api/mover/governance/types';
import { isProviderRpcError } from '@/services/v2/on-chain';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
import { formatToDecimals } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import {
  Markdown,
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'GovernanceCreateProposal',
  components: {
    ProductInfoWrapper,
    ProductInfoItem,
    SecondaryPage,
    SecondaryPageHeader,
    Markdown,
    ActionButton
  },
  data() {
    return {
      proposalTemplate: {
        title: '',
        description: ''
      },
      isLoading: false,
      errorText: '',
      isPreviewEnabled: false,
      resizeDebounceHandler: undefined as undefined | number
    };
  },
  computed: {
    ...mapState('governance', ['currentVotingInfo']),
    isGovernanceMarkdownEnabled(): boolean {
      return isFeatureEnabled(
        'isGovernanceMarkdownEnabled',
        this.currentNetwork
      );
    },
    daysToRun(): string {
      const days =
        this.currentVotingInfo.votingDuration / 1000_000 / 1000 / 3600 / 24;
      return this.$t('governance.lblRemainingDays', { days: days }) as string;
    },
    minimumVotingThresholdText(): string {
      return formatToDecimals(this.currentVotingInfo.minimalVotingPower, 0);
    },
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    }
  },
  methods: {
    ...mapActions('governance', ['createProposal']),
    handleBack(): void {
      this.$router.replace({ name: 'governance-view-all' });
    },
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    },
    async handleSubmit(): Promise<void> {
      this.errorText = '';
      this.$v.proposalTemplate.$touch();
      if (this.$v.proposalTemplate.$error) {
        return;
      }

      try {
        this.errorText = '';
        this.isLoading = true;

        const createdProposal: CreateProposalResponse =
          await this.createProposal({
            name: this.proposalTemplate.title,
            body: this.proposalTemplate.description
          } as CreateProposalParams);

        this.$v.proposalTemplate.$reset();
        this.proposalTemplate = { title: '', description: '' };

        await this.$router.replace({
          name: 'governance-view',
          params: {
            id: createdProposal.id
          }
        });
      } catch (error) {
        if (
          error instanceof MoverAPIError &&
          [
            ErrorCode.EmptyProposalBody,
            ErrorCode.EmptyProposalName,
            ErrorCode.InsufficientVotingPower,
            ErrorCode.ProposalNameTooLarge,
            ErrorCode.ProposalDescriptionTooLarge
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
            this.errorText = this.$t(`provider.errors.${error.code}`) as string;
          }
          return;
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

        this.errorText = this.$t('governance.errors.default') as string;
      } finally {
        this.isLoading = false;
      }
    },
    togglePreview(): void {
      this.isPreviewEnabled = !this.isPreviewEnabled;
      this.resizeTextArea();
    },
    resizeTextArea(): void {
      window.clearTimeout(this.resizeDebounceHandler);

      this.resizeDebounceHandler = window.setTimeout(() => {
        const el = this.$refs.textarea as HTMLTextAreaElement | undefined;
        if (el === undefined) {
          return;
        }

        el.style.height = `${el.scrollHeight + 8}px`;
      }, 250);
    }
  },
  validations: {
    proposalTemplate: {
      title: {
        required,
        maxLength: maxLength(256)
      },
      description: {
        required,
        maxLength: maxLength(10000)
      }
    }
  }
});
</script>
