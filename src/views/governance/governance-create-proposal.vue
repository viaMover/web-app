<template>
  <content-wrapper
    class="governance create-a-proposal"
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-nav-my-governance />
      <governance-nav-manage-governance />
    </template>

    <secondary-page has-back-button hide-info @back="handleBack">
      <template v-slot:title>
        <secondary-page-header
          :description="$t('governance.txtCreateAProposal')"
          :title="$t('governance.lblCreateAProposal')"
        />
      </template>

      <div class="column">
        <div class="item">
          <span>{{ daysToRun }}</span>
          <p>{{ $t('governance.lblDaysToRun') }}</p>
        </div>
        <div class="item">
          <span>{{ minimumVotingThresholdText }}</span>
          <p>{{ $t('governance.lblMinimumVotingThreshold') }}</p>
        </div>
      </div>

      <p class="text">{{ $t('governance.txtCreateAProposalTip') }}</p>

      <div class="statements">
        <form
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
            <span
              v-if="!$v.proposalTemplate.title.required"
              class="error-message"
            >
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
                v-if="isFeatureEnabled('isGovernanceMarkdownEnabled')"
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
                :placeholder="
                  $t('governance.txtProposalDescriptionPlaceholder')
                "
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
              {{
                $t('governance.createProposal.validations.description.required')
              }}
            </span>
            <span
              v-if="!$v.proposalTemplate.description.maxLength"
              class="error-message"
            >
              {{
                $t(
                  'governance.createProposal.validations.description.maxLength',
                  {
                    boundary: $v.proposalTemplate.description.$params.maxLength
                  }
                )
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
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { maxLength, required } from 'vuelidate/lib/validators';
import { mapActions, mapGetters, mapState } from 'vuex';

import {
  CreateProposalResponse,
  GovernanceApiError
} from '@/services/mover/governance';
import { isFeatureEnabled } from '@/settings';
import {
  CreateProposalPayload,
  LoadProposalInfoPayload
} from '@/store/modules/governance/types';
import { isProviderRpcError } from '@/store/modules/governance/utils';
import { formatToDecimals } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import {
  GovernanceNavManageGovernance,
  GovernanceNavMyGovernance
} from '@/components/governance';
import {
  ContentWrapper,
  Markdown,
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceCreateProposal',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ContentWrapper,
    Markdown,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
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
    ...mapState('governance', {
      daysToRun: 'proposalDurationDays'
    }),
    ...mapGetters('governance', {
      minimumVotingThreshold: 'minimumVotingThreshold'
    }),
    minimumVotingThresholdText(): string {
      return formatToDecimals(this.minimumVotingThreshold, 0);
    },
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    }
  },
  methods: {
    ...mapActions('governance', {
      createProposal: 'createProposal',
      loadProposalInfo: 'loadProposalInfo'
    }),
    isFeatureEnabled,
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

      this.errorText = '';
      this.isLoading = true;

      try {
        const createdProposal: CreateProposalResponse =
          await this.createProposal({
            title: this.proposalTemplate.title,
            description: this.proposalTemplate.description
          } as CreateProposalPayload);

        this.$v.proposalTemplate.$reset();
        this.proposalTemplate = { title: '', description: '' };

        await this.loadProposalInfo({
          id: createdProposal.id,
          refetch: true
        } as LoadProposalInfoPayload);
        await this.$router.replace({
          name: 'governance-view',
          params: {
            id: createdProposal.id
          }
        });
      } catch (error) {
        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
          }
          return;
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

        el.style.height = `${el.scrollHeight}px`;
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
