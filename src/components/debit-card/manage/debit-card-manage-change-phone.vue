<template>
  <secondary-page hide-title>
    <secondary-page-simple-title
      class="page-title max-width"
      :description="$t('debitCard.txtOrderCard')"
      :title="$t('debitCard.lblOrderCard')"
    />

    <div class="content">
      <div class="floating right container">
        <debit-card-image class="small" :skin="currentSkin" />
      </div>

      <div class="container margin-top-80">
        <form
          class="form change-phone"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleChangePhoneNumber"
        >
          <div class="input-group" :class="{ error: $v.phoneNumber.$error }">
            <label>
              {{ $t('debitCard.lblYourPhoneNumber') }}
              <the-mask
                v-model="phoneNumber"
                autocomplete="tel"
                :disabled="isLoading"
                mask="+###############"
                name="phone"
                :placeholder="$t('debitCard.txtYourPhoneNumberPlaceholder')"
                type="tel"
              />
            </label>
            <span v-if="!$v.phoneNumber.required" class="error-message">
              {{ $t('debitCard.errors.phoneNumber.required') }}
            </span>
            <span v-if="!$v.phoneNumber.minLength" class="error-message">
              {{
                $t('debitCard.errors.phoneNumber.minLength', {
                  minLength: $v.phoneNumber.$params.minLength.min
                })
              }}
            </span>
            <span v-if="!$v.phoneNumber.maxLength" class="error-message">
              {{
                $t('debitCard.errors.phoneNumber.maxLength', {
                  maxLength: $v.phoneNumber.$params.maxLength.max
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
              {{ $t('debitCard.btnChangePhoneNumber') }}
            </template>
          </action-button>
          <span v-if="errorText !== ''" class="error-message">
            {{ errorText }}
          </span>
        </form>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { TheMask } from 'vue-the-mask';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
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
  name: 'DebitCardManageChangePhone',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage,
    SecondaryPageSimpleTitle,
    TheMask
  },
  data() {
    return {
      isLoading: false,
      errorText: '',

      phoneNumber: ''
    };
  },
  computed: {
    ...mapState('debitCard', {
      savedPhoneNumber: 'phoneNumber'
    }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    })
  },
  watch: {
    savedPhoneNumber: {
      handler(newValue): void {
        this.phoneNumber = newValue;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('debitCard', {
      changePhoneNumber: 'changePhoneNumber'
    }),
    async handleChangePhoneNumber(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.changePhoneNumber(this.phoneNumber);
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

        if (error instanceof DebitCardApiError) {
          if (
            error.shortMessage !== undefined &&
            this.$te(`debitCard.errors.${error.shortMessage}`)
          ) {
            this.errorText = this.$t(
              `debitCard.errors.${error.message}`
            ) as string;
            this.scrollButtonIntoView();
            this.isLoading = false;
            return;
          }

          if (this.$te(`debitCard.errors.${error.message}`)) {
            this.errorText = this.$t(
              `debitCard.errors.${error.message}`
            ) as string;
            this.scrollButtonIntoView();
            this.isLoading = false;
            return;
          }
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
    phoneNumber: {
      required,
      minLength: minLength(11),
      maxLength: maxLength(15)
    }
  }
});
</script>
