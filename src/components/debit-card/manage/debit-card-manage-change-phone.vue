<template>
  <secondary-page class="manage change-phone">
    <template v-slot:title>
      <secondary-page-header
        class="max-width"
        :description="$t('debitCard.txtOrderCard')"
        :title="$t('debitCard.lblOrderCard')"
      />
    </template>

    <template v-slot:info>
      <debit-card-image class="small" :skin="currentSkin" />
    </template>

    <form
      class="form info change-phone"
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

      <div class="actions">
        <div class="group default">
          <action-button
            ref="button"
            class="button primary"
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
import { TheMask } from 'vue-the-mask';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import { mapActions, mapGetters, mapState } from 'vuex';

import {
  DebitCardApiError,
  DebitCardNotSupportedCountryError
} from '@/services/mover/debit-card';
import { isProviderRpcError } from '@/services/v2/on-chain';
import { mapCountryCodeToEmoji } from '@/utils/emoji';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageChangePhone',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ActionButton,
    DebitCardImage,
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
      } catch (error) {
        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (error instanceof DebitCardNotSupportedCountryError) {
          if (
            error.additionalPayload?.country !== undefined &&
            error.additionalPayload?.countryName !== undefined
          ) {
            this.errorText = this.$t('debitCard.errors.notSupportedCountry', {
              flag: mapCountryCodeToEmoji(
                error.additionalPayload.country,
                true
              ),
              country: error.additionalPayload.countryName
            }) as string;
            return;
          }

          this.errorText = this.$t(
            'debitCard.errors.notSupportedCountryFallback'
          ) as string;
          return;
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
    phoneNumber: {
      required,
      minLength: minLength(10),
      maxLength: maxLength(15)
    }
  }
});
</script>
