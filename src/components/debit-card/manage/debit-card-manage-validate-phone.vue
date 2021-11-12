<template>
  <secondary-page hide-title>
    <secondary-page-simple-title
      class="page-title max-width"
      :description="pageDescription"
      :title="$t('debitCard.lblValidateYourNumber')"
    />

    <div class="content">
      <div class="floating right container">
        <debit-card-image class="small" :skin="currentSkin" />
      </div>

      <div class="container margin-top-80">
        <form
          class="form validate"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleValidatePhoneNumber"
        >
          <div class="input-group" :class="{ error: $v.code.$error }">
            <label>
              {{ $t('debitCard.lblYourSecurityCode') }}
              <input
                v-model.trim="code"
                autocomplete="one-time-code"
                autofocus
                :disabled="isLoading"
                maxlength="4"
                minLength="4"
                name="code"
                :placeholder="$t('debitCard.txtYourSecurityCodePlaceholder')"
                type="text"
              />
            </label>
            <span v-if="!$v.code.required" class="error-message">
              {{ $t('debitCard.errors.code.required') }}
            </span>
            <span v-if="!$v.code.numeric" class="error-message">
              {{ $t('debitCard.errors.code.numeric') }}
            </span>
            <span v-if="!$v.code.length" class="error-message">
              {{
                $t('debitCard.errors.code.length', {
                  length: $v.code.$params.length.sub[0].max
                })
              }}
            </span>
          </div>

          <action-button
            ref="button"
            button-class="black-link button-active action-button"
            :disabled="isLoading"
            propagate-original-event
            type="submit"
          >
            <div v-if="isLoading" class="loader-icon">
              <img
                :alt="$t('icon.txtPendingIconAlt')"
                src="@/assets/images/ios-spinner-white.svg"
              />
            </div>
            <template v-else>
              {{ $t('debitCard.btnOrderCard') }}
            </template>
          </action-button>
          <span v-if="errorText !== ''" class="error-message">
            {{ errorText }}
          </span>

          <button
            class="
              button-active button-image button-transparent button-change-number
            "
            :disabled="isLoading"
            type="button"
            @click="handleChangePhoneNumber"
          >
            <img
              :alt="$t('icon.txtBackLinkIconAlt')"
              src="@/assets/images/redo.svg"
            />
            {{ $t('debitCard.btnChangePhoneNumber') }}
          </button>
        </form>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  and,
  maxLength,
  minLength,
  numeric,
  required
} from 'vuelidate/lib/validators';
import { mapActions, mapGetters, mapState } from 'vuex';

import { DebitCardApiError } from '@/services/mover/debit-card';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/governance/utils';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageValidatePhone',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage,
    SecondaryPageSimpleTitle
  },
  data() {
    return {
      code: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('debitCard', {
      savedEmail: 'email',
      savedPhoneNumber: 'phoneNumber'
    }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    formattedPhoneNumber(): string | undefined {
      return this.savedPhoneNumber?.slice(-4);
    },
    pageDescription(): string {
      if (this.formattedPhoneNumber === undefined) {
        return this.$t('debitCard.txtEnterSecurityCode') as string;
      }

      return `${this.$t('debitCard.txtEnterSecurityCode')} to *${
        this.formattedPhoneNumber
      }`;
    }
  },
  methods: {
    ...mapActions('debitCard', {
      validatePhoneNumber: 'validatePhoneNumber',
      setOrderState: 'setOrderState'
    }),
    async handleValidatePhoneNumber(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.validatePhoneNumber(this.code);
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
          error instanceof DebitCardApiError &&
          this.$te(`debitCard.errors.${error.message}`)
        ) {
          this.errorText = this.$t(
            `debitCard.errors.${error.message}`
          ) as string;
          this.scrollButtonIntoView();
          this.isLoading = false;
          return;
        }

        this.errorText = this.$t('debitCard.errors.default') as string;
        this.scrollButtonIntoView();
        this.isLoading = false;
      }
    },
    scrollButtonIntoView(): void {
      this.$nextTick(() => {
        ((this.$refs.button as Vue).$el as HTMLElement).scrollIntoView();
      });
    },
    handleChangePhoneNumber(): void {
      this.setOrderState('change_phone');
    }
  },
  validations: {
    code: {
      required,
      numeric,
      length: and(maxLength(4), minLength(4))
    }
  }
});
</script>
