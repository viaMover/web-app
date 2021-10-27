<template>
  <div class="body">
    <div class="card-image-container">
      <debit-card-image :image="currentSkin" />
    </div>
    <p class="small description">
      {{ $t('debitCard.txtBeautifulCardBenifits') }}
    </p>
    <div class="container info-group col3">
      <div>
        <span class="title">{{ $t('debitCard.lblFree') }}</span>
        <p class="description black">{{ $t('debitCard.txtFree') }}</p>
      </div>
      <div>
        <span class="title">{{ $t('debitCard.lblNoLimit') }}</span>
        <p class="description black">{{ $t('debitCard.txtNoLimit') }}</p>
      </div>
      <div>
        <span class="title">{{ $t('debitCard.lblEUR') }}</span>
        <p class="description black">{{ $t('debitCard.txtEUR') }}</p>
      </div>
    </div>
    <div
      class="form-wrapper"
      :class="{ error: $v.$anyError || errorText !== '' }"
    >
      <form class="form order" @submit.prevent="handleValidateOrOrderCard">
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
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          propagate-original-event
          type="submit"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img
              :alt="$t('txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
          </div>
          <template v-else>
            {{
              isButtonActive ? $t('debitCard.btnValidateOrOrderCard') : error
            }}
          </template>
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { email, required } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';

import { DebitCardApiError } from '@/services/mover';
import { ValidateOrOrderCardParams } from '@/store/modules/debit-card/types';

import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'DebitCardManageEmpty',
  components: {
    ActionButton
  },
  data() {
    return {
      email: '',
      isLoading: false,
      errorText: ''
    };
  },
  methods: {
    ...mapActions('debitCard', {
      validateOrOrderCard: 'validateOrOrderCard'
    }),
    async handleValidateOrOrderCard(): Promise<void> {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        return;
      }

      try {
        this.isLoading = true;
        await this.validateOrOrderCard({
          email: this.email
        } as ValidateOrOrderCardParams);
      } catch (error) {
        if (
          error instanceof DebitCardApiError &&
          this.$te(`debitCard.errors.${error.message}`)
        ) {
          this.errorText = this.$t(
            `debitCard.errors.${error.message}`
          ) as string;
          this.isLoading = false;
          return;
        }

        this.errorText = this.$t('debitCard.errors.default') as string;
        this.isLoading = false;
      }
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
