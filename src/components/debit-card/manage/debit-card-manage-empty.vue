<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description subtitle black">
      {{ $t('debitCard.txtBeautifulCard') }}
    </p>

    <div class="content">
      <div class="container">
        <debit-card-image :skin="currentSkin" />
      </div>
      <p class="description">
        {{ $t('debitCard.txtBeautifulCardBenifits') }}
      </p>
      <div class="container info-group card-info">
        <div class="item">
          <div class="title">{{ $t('debitCard.lblFree') }}</div>
          <p class="description subtitle black">
            {{ $t('debitCard.txtFree') }}
          </p>
        </div>
        <div class="item">
          <div class="title">{{ $t('debitCard.lblNoLimit') }}</div>
          <p class="description subtitle black">
            {{ $t('debitCard.txtNoLimit') }}
          </p>
        </div>
        <div class="item">
          <div class="title">{{ $t('debitCard.lblEUR') }}</div>
          <p class="description subtitle black">{{ $t('debitCard.txtEUR') }}</p>
        </div>
      </div>

      <form
        class="form order"
        :class="{ error: $v.$anyError || errorText !== '' }"
        @submit.prevent="handleValidateOrOrderCard"
      >
        <div class="input-group" :class="{ error: $v.email.$error }">
          <label>
            {{ $t('debitCard.lblYourEmailAddress') }}
            <input
              v-model="email"
              autocomplete="email"
              autofocus
              :name="$t('debitCard.lblYourEmailAddress')"
              :placeholder="$t('debitCard.txtYourEmailAddressPlaceholder')"
              tabindex="1"
              type="text"
            />
          </label>
          <span v-if="!$v.email.required" class="error-message">{{
            $t('debitCard.errors.email.required')
          }}</span>
          <span v-if="!$v.email.isValidEmail" class="error-message">{{
            $t('debitCard.errors.email.invalid')
          }}</span>
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
            {{ $t('debitCard.btnValidateOrOrderCard') }}
          </template>
        </action-button>
        <span v-if="errorText !== ''" class="error-message">{{
          errorText
        }}</span>
      </form>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { email, required } from 'vuelidate/lib/validators';
import { mapActions, mapGetters } from 'vuex';

import { DebitCardApiError } from '@/services/mover';
import { ValidateOrOrderCardParams } from '@/store/modules/debit-card/types';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageEmpty',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage
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
      validateOrOrderCard: 'validateOrOrderCard'
    }),
    async handleValidateOrOrderCard(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.validateOrOrderCard({
          email: this.email
        } as ValidateOrOrderCardParams);
        this.isLoading = false;
      } catch (error) {
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
