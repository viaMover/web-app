<template>
  <secondary-page class="manage set-email">
    <template v-slot:title>
      <secondary-page-header
        class="alternate"
        :description="$t('debitCard.txtBeautifulCard')"
        :title="$t('debitCard.lblBeautifulCard')"
      />
    </template>

    <debit-card-image :skin="currentSkin" />

    <div class="tip">{{ $t('debitCard.txtBeautifulCardBenefits') }}</div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('debitCard.txtFree')"
        :title="$t('debitCard.lblFree')"
      />
      <product-info-item
        :description="$t('debitCard.txtNoLimit')"
        :title="$t('debitCard.lblNoLimit')"
      />
      <product-info-item
        :description="$t('debitCard.txtEUR')"
        :title="$t('debitCard.lblEUR')"
      />
    </product-info-wrapper>

    <form
      class="form info email"
      :class="{ error: $v.$anyError || errorText !== '' }"
      @submit.prevent="handleSetEmail"
    >
      <div class="input-group" :class="{ error: $v.email.$error }">
        <label>
          {{ $t('debitCard.lblYourEmailAddress') }}
          <input
            v-model.trim="email"
            autocomplete="email"
            autofocus
            :disabled="isLoading"
            name="email"
            :placeholder="$t('debitCard.txtYourEmailAddressPlaceholder')"
            type="text"
          />
        </label>
        <span v-if="!$v.email.required" class="error-message">
          {{ $t('debitCard.errors.email.required') }}
        </span>
        <span v-if="!$v.email.isValidEmail" class="error-message">
          {{ $t('debitCard.errors.email.invalid') }}
        </span>
      </div>

      <div class="actions">
        <div class="group default">
          <action-button
            ref="button"
            class="primary"
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
              {{ $t('debitCard.btnValidateOrOrderCard') }}
            </template>
          </action-button>
        </div>

        <div v-if="errorText !== ''" class="group error-message">
          {{ errorText }}
        </div>
      </div>
    </form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { email, required } from 'vuelidate/lib/validators';
import { mapActions, mapGetters } from 'vuex';

import { DebitCardApiError } from '@/services/mover/debit-card';
import { isProviderRpcError } from '@/services/v2/on-chain';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageSetEmail',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    DebitCardImage,
    ProductInfoWrapper,
    ProductInfoItem,
    ActionButton
  },
  data() {
    return {
      email: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    })
  },
  methods: {
    ...mapActions('debitCard', {
      setEmail: 'setEmail'
    }),
    async handleSetEmail(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.setEmail(this.email);
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
    }
  },
  validations: {
    email: {
      required,
      isValidEmail: email
    }
  }
});
</script>
