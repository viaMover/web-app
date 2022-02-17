<template>
  <secondary-page class="manage validate-phone">
    <template v-slot:title>
      <secondary-page-header
        class="page-title max-width"
        :description="pageDescription"
        :title="$t('debitCard.lblValidateYourNumber')"
      />
    </template>
    <template v-slot:info>
      <debit-card-image class="small" :skin="currentSkin" />
    </template>

    <form
      class="form validate-phone"
      :class="{
        error: $v.$anyError || errorText !== '',
        disabled: !!kycLink
      }"
      :disabled="!!kycLink"
      @submit.prevent="handleValidatePhoneNumber"
    >
      <div class="input-group" :class="{ error: $v.code.$error }">
        <label>
          {{ $t('debitCard.lblYourSecurityCode') }}
          <input
            v-model.trim="code"
            autocomplete="one-time-code"
            autofocus
            :disabled="isLoading || !!kycLink"
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
              length: 4
            })
          }}
        </span>
      </div>

      <div class="actions">
        <div class="group">
          <action-button
            ref="button"
            class="primary"
            :disabled="isLoading || !!kycLink"
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
        </div>

        <div v-if="errorText !== ''" class="group error-message">
          {{ errorText }}
        </div>

        <div class="group">
          <button
            class="transparent icon button no-padding"
            :disabled="isLoading || !!kycLink"
            type="button"
            @click="handleChangePhoneNumber"
          >
            <img
              :alt="$t('icon.txtBackLinkIconAlt')"
              src="@/assets/images/redo.svg"
            />
            {{ $t('debitCard.btnChangePhoneNumber') }}
          </button>
        </div>
      </div>
    </form>

    <form v-if="!!kycLink" class="form" @submit.prevent="handleProceed">
      <div class="actions">
        <i18n
          ref="linkContainer"
          class="group kyc-link"
          path="debitCard.kycLink.description"
          tag="div"
        >
          <a class="link underline medium" :href="kycLink" target="_blank">
            {{ $t('debitCard.kycLink.link') }}
          </a>
        </i18n>

        <div class="group">
          <action-button class="primary" propagate-original-event type="submit">
            {{ $t('debitCard.lblProceedAfterKyc') }}
          </action-button>
        </div>
      </div>
    </form>
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
import { isProviderRpcError } from '@/store/modules/governance/utils';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageValidatePhone',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage,
    SecondaryPageHeader
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
      savedPhoneNumber: 'phoneNumber',
      kycLink: 'kycLink'
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
      setOrderState: 'setOrderState',
      loadInfo: 'loadInfo'
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
      } catch (error) {
        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (error instanceof DebitCardApiError) {
          if (
            error.shortMessage !== undefined &&
            this.$te(`debitCard.errors.${error.shortMessage}`)
          ) {
            this.errorText = this.$t(
              `debitCard.errors.${error.message}`
            ) as string;
            return;
          }

          if (this.$te(`debitCard.errors.${error.message}`)) {
            this.errorText = this.$t(
              `debitCard.errors.${error.message}`
            ) as string;
            return;
          }
        }

        this.errorText = this.$t('debitCard.errors.default') as string;
      } finally {
        this.scrollButtonIntoView();
        this.isLoading = false;
      }
    },
    scrollButtonIntoView(): void {
      this.$nextTick(() => {
        ((this?.$refs?.button as Vue)?.$el as HTMLElement)?.scrollIntoView?.();
      });
    },
    handleChangePhoneNumber(): void {
      this.setOrderState('change_phone');
    },
    async handleProceed(): Promise<void> {
      await this.loadInfo(true);
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
