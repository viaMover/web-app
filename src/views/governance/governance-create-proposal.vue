<template>
  <content-wrapper
    base-class="info__wrapper"
    has-back-button
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="product-item__wrapper create-a-proposal__wrapper"
    wrapper-class="create-a-proposal"
    @back="handleBack"
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
          <button
            class="black-link button-active"
            :class="{ disabled: isLoading }"
            :disabled="isLoading"
            tabindex="4"
            type="submit"
          >
            {{ $t('governance.lblCreateAProposal') }}
          </button>
          <span v-if="errorText" class="error-message">
            {{ errorText }}
          </span>
        </form>
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { required, maxLength } from 'vuelidate/lib/validators';

import { formatToDecimals } from '@/utils/format';
import {
  CreateProposalPayload,
  LoadProposalInfoPayload
} from '@/store/modules/governance/types';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/governance/utils';
import {
  CreateProposalResponse,
  GovernanceApiError
} from '@/services/mover/governance';

import {
  SecondaryPage,
  ContentWrapper,
  LeftRailSection,
  Markdown
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
    Markdown,
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
