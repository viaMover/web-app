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

      <div class="container">
        <form
          class="form order"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleRedeem"
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

          <div class="input-group" :class="{ error: $v.givenName.$error }">
            <label>
              {{ $t('debitCard.lblYourGivenName') }}
              <input
                v-model.trim="givenName"
                autocomplete="given-name"
                :disabled="isLoading"
                name="given-name"
                :placeholder="$t('debitCard.txtYourGivenNamePlaceholder')"
                type="text"
              />
            </label>
            <span v-if="!$v.givenName.required" class="error-message">
              {{ $t('debitCard.errors.givenName.required') }}
            </span>
            <span v-if="!$v.givenName.valid" class="error-message">
              {{ $t('debitCard.errors.givenName.invalid') }}
            </span>
          </div>

          <div class="input-group" :class="{ error: $v.familyName.$error }">
            <label>
              {{ $t('debitCard.lblYourFamilyName') }}
              <input
                v-model.trim="familyName"
                autocomplete="family-name"
                :disabled="isLoading"
                name="family-name"
                :placeholder="$t('debitCard.txtYourFamilyNamePlaceholder')"
                type="text"
              />
            </label>
            <span v-if="!$v.familyName.required" class="error-message">
              {{ $t('debitCard.errors.familyName.required') }}
            </span>
            <span v-if="!$v.familyName.valid" class="error-message">
              {{ $t('debitCard.errors.familyName.invalid') }}
            </span>
          </div>

          <div class="input-group input-dropdown">
            <label>
              {{ $t('debitCard.lblYourTitle.label') }}
              <select
                v-model="title"
                autocomplete="sex"
                :class="{ placeholder: title === '' }"
              >
                <option disabled hidden value="">
                  {{ $t('debitCard.lblYourTitle.placeholder') }}
                </option>
                <option value="Mr">
                  {{ $t('debitCard.lblYourTitle.mr') }}
                </option>
                <option value="Miss">
                  {{ $t('debitCard.lblYourTitle.miss') }}
                </option>
                <option value="Mrs">
                  {{ $t('debitCard.lblYourTitle.mrs') }}
                </option>
                <option value="Dr">
                  {{ $t('debitCard.lblYourTitle.dr') }}
                </option>
              </select>
            </label>
            <span v-if="!$v.title.required" class="error-message">
              {{ $t('debitCard.errors.title.required') }}
            </span>
          </div>

          <div v-show="title === 'Dr'" class="input-group input-dropdown">
            <label>
              {{ $t('debitCard.lblYourGender.label') }}
              <select
                v-model="gender"
                autocomplete="honorific-prefix"
                :class="{ placeholder: gender === '' }"
              >
                <option disabled hidden value="">
                  {{ $t('debitCard.lblYourGender.placeholder') }}
                </option>
                <option value="M">
                  {{ $t('debitCard.lblYourGender.male') }}
                </option>
                <option value="F">
                  {{ $t('debitCard.lblYourGender.female') }}
                </option>
              </select>
            </label>
            <span v-if="!$v.gender.required" class="error-message">
              {{ $t('debitCard.errors.gender.required') }}
            </span>
          </div>

          <div class="input-group">
            <label>
              {{ $t('debitCard.lblYourDateOfBirth') }}
              <input
                v-model="dateOfBirth"
                autocomplete="bday"
                :disabled="isLoading"
                :max="dateOfBirthMax"
                :min="dateOfBirthMin"
                name="date-of-birth"
                type="date"
              />
            </label>
            <span v-if="!$v.dateOfBirth.required" class="error-message">
              {{ $t('debitCard.errors.dateOfBirth.required') }}
            </span>
            <span v-if="!$v.dateOfBirth.valid" class="error-message">
              {{ $t('debitCard.errors.dateOfBirth.invalid') }}
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
        </form>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { TheMask } from 'vue-the-mask';
import {
  email,
  maxLength,
  minLength,
  required
} from 'vuelidate/lib/validators';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import {
  DebitCardApiError,
  DebitCardNotSupportedCountryError
} from '@/services/mover/debit-card';
import { OrderCardParams } from '@/store/modules/debit-card/types';
import { isProviderRpcError } from '@/store/modules/governance/utils';
import { mapCountryCodeToEmoji } from '@/utils/emoji';
import { validateName } from '@/utils/validators';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageOrderCard',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage,
    SecondaryPageSimpleTitle,
    TheMask
  },
  data() {
    return {
      email: '',
      phoneNumber: '',
      gender: '',
      title: '',
      familyName: '',
      givenName: '',
      dateOfBirth: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('debitCard', {
      savedEmail: 'email'
    }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    dateOfBirthMin(): string {
      return dayjs()
        .subtract(150, 'years')
        .startOf('year')
        .format('YYYY-MM-DD');
    },
    dateOfBirthMax(): string {
      return dayjs().add(1, 'day').format('YYYY-MM-DD');
    }
  },
  watch: {
    title: {
      handler(newValue: string): void {
        switch (newValue) {
          case 'Mr':
            this.gender = 'M';
            break;
          case 'Miss':
          case 'Mrs':
            this.gender = 'F';
            break;
          case 'Dr':
          default:
            this.gender = '';
        }
      },
      immediate: true
    },
    savedEmail: {
      handler(newValue: string | undefined): void {
        if (newValue !== undefined && this.email === '') {
          this.email = newValue;
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('debitCard', {
      orderCard: 'orderCard'
    }),
    async handleOrderCard(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      try {
        this.isLoading = true;
        await this.orderCard({
          email: this.email,
          phone: this.phoneNumber,
          gender: this.gender,
          lastName: this.familyName,
          firstName: this.givenName,
          dateOfBirth: dayjs(this.dateOfBirth).format('YYYY-MM-DD'),
          title: this.title
        } as OrderCardParams);
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
    email: {
      required,
      isValidEmail: email
    },
    phoneNumber: {
      required,
      minLength: minLength(10),
      maxLength: maxLength(15)
    },
    familyName: {
      required,
      valid: validateName
    },
    givenName: {
      required,
      valid: validateName
    },
    dateOfBirth: {
      required,
      valid: (date: string) => dayjs(date).isValid()
    },
    title: {
      required
    },
    gender: {
      required
    }
  }
});
</script>
