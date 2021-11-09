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
        v-if="cardState === 'request_email'"
        class="form email"
        :class="{ error: $v.email.$error || errorText !== '' }"
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
              :name="$t('debitCard.lblYourEmailAddress')"
              :placeholder="$t('debitCard.txtYourEmailAddressPlaceholder')"
              tabindex="1"
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

        <action-button
          ref="button"
          button-class="black-link button-active action-button"
          :disabled="isLoading"
          propagate-original-event
          tabindex="9"
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
        <span v-if="errorText !== ''" class="error-message">
          {{ errorText }}
        </span>
      </form>
      <form
        v-else
        class="form order"
        :class="{ error: $v.$anyError || errorText !== '' }"
        @submit.prevent="handleOrderCard"
      >
        <div class="input-group" :class="{ error: $v.email.$error }">
          <label>
            {{ $t('debitCard.lblYourEmailAddress') }}
            <input
              v-model.trim="email"
              autocomplete="email"
              autofocus
              :disabled="isLoading"
              :name="$t('debitCard.lblYourEmailAddress')"
              :placeholder="$t('debitCard.txtYourEmailAddressPlaceholder')"
              tabindex="1"
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
              :name="$t('debitCard.lblYourPhoneNumber')"
              :placeholder="$t('debitCard.txtYourPhoneNumberPlaceholder')"
              tabindex="2"
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
              :name="$t('debitCard.lblYourGivenName')"
              :placeholder="$t('debitCard.txtYourGivenNamePlaceholder')"
              tabindex="3"
              type="text"
            />
          </label>
          <span v-if="!$v.givenName.required" class="error-message">
            {{ $t('debitCard.errors.givenName.required') }}
          </span>
        </div>

        <div class="input-group" :class="{ error: $v.familyName.$error }">
          <label>
            {{ $t('debitCard.lblYourFamilyName') }}
            <input
              v-model.trim="familyName"
              autocomplete="family-name"
              :disabled="isLoading"
              :name="$t('debitCard.lblYourFamilyName')"
              :placeholder="$t('debitCard.txtYourFamilyNamePlaceholder')"
              tabindex="4"
              type="text"
            />
          </label>
          <span v-if="!$v.familyName.required" class="error-message">
            {{ $t('debitCard.errors.familyName.required') }}
          </span>
        </div>

        <div class="input-group input-radio-group">
          <h3 class="group-label">{{ $t('debitCard.lblYourGender.title') }}</h3>
          <div class="choices">
            <label>
              <span>{{ $t('debitCard.lblYourGender.male') }}</span>
              <input
                v-model="gender"
                :disabled="isLoading"
                :name="$t('debitCard.lblYourGender.male')"
                tabindex="5"
                type="radio"
                value="M"
              />
            </label>
            <label>
              <span>{{ $t('debitCard.lblYourGender.female') }}</span>
              <input
                v-model="gender"
                :disabled="isLoading"
                :name="$t('debitCard.lblYourGender.female')"
                tabindex="6"
                type="radio"
                value="F"
              />
            </label>
            <label>
              <span>{{ $t('debitCard.lblYourGender.other') }}</span>
              <input
                v-model="gender"
                :disabled="isLoading"
                :name="$t('debitCard.lblYourGender.other')"
                tabindex="7"
                type="radio"
                value="O"
              />
            </label>
          </div>
        </div>

        <input
          disabled
          :name="$t('debitCard.lblYourHonorificPrefix')"
          :placeholder="$t('debitCard.txtYourHonorificPrefixPlaceholder')"
          type="hidden"
          :value="honorificPrefix"
        />

        <div class="input-group">
          <label>
            {{ $t('debitCard.lblYourDateOfBirth') }}
            <input
              v-model="dateOfBirth"
              autocomplete="bday"
              :disabled="isLoading"
              :max="dateOfBirthMax"
              :min="dateOfBirthMin"
              :name="$t('debitCard.lblYourDateOfBirth')"
              tabindex="8"
              type="date"
            />
          </label>
          <span v-if="!$v.dateOfBirth.required" class="error-message">
            {{ $t('debitCard.errors.dateOfBirth.required') }}
          </span>
        </div>

        <action-button
          ref="button"
          button-class="black-link button-active action-button"
          :disabled="isLoading"
          propagate-original-event
          tabindex="9"
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
        <span v-if="errorText !== ''" class="error-message">
          {{ errorText }}
        </span>
      </form>
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

import { DebitCardApiError } from '@/services/mover/debit-card';
import { OrderCardParams } from '@/store/modules/debit-card/types';
import {
  isProviderRpcError,
  ProviderRpcError
} from '@/store/modules/governance/utils';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageEmpty',
  components: {
    ActionButton,
    DebitCardImage,
    SecondaryPage,
    TheMask
  },
  data() {
    return {
      email: '',
      phoneNumber: '',
      gender: 'M' as 'M' | 'F' | 'O',
      familyName: '',
      givenName: '',
      dateOfBirth: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('debitCard', {
      cardState: 'cardState',
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
    },
    honorificPrefix(): string {
      switch (this.gender) {
        case 'F':
          return 'Ms.';
        case 'M':
          return 'Mr.';
        case 'O':
        default:
          return 'Mx.';
      }
    }
  },
  watch: {
    savedEmail: {
      handler(newValue: string | undefined): void {
        if (this.email === '' && newValue !== undefined) {
          this.email = newValue;
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('debitCard', {
      orderCard: 'orderCard',
      setEmail: 'setEmail',
      loadInfo: 'loadInfo'
    }),
    async handleSetEmail(): Promise<void> {
      this.errorText = '';
      this.$v.email.$touch();

      if (this.$v.email.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.setEmail(this.email);
        await this.loadInfo(true);
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
    async handleOrderCard(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.orderCard({
          email: this.email,
          phone: `+${this.phoneNumber}`,
          gender: this.gender,
          lastName: this.familyName,
          firstName: this.givenName,
          dateOfBirth: dayjs(this.dateOfBirth).format('YYYY-MM-DD'),
          honorificPrefix: this.honorificPrefix
        } as OrderCardParams);
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
    }
  },
  validations: {
    email: {
      required,
      isValidEmail: email
    },
    phoneNumber: {
      required,
      minLength: minLength(11),
      maxLength: maxLength(15)
    },
    familyName: {
      required
    },
    givenName: {
      required
    },
    dateOfBirth: {
      required
    }
  }
});
</script>
