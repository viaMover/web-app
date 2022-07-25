<template>
  <secondary-page class="manage set-email">
    <template v-slot:title>
      <secondary-page-header
        v-if="showShareButton"
        :description="$t('tag.shareTagDescription')"
        :title="$t('tag.shareTagTitle', { tag: reservedTag })"
      />
      <secondary-page-header
        v-else
        :description="$t('tag.reserveTagDescription')"
        :title="$t('tag.reserveTagTitle')"
      />
    </template>

    <form
      class="form info"
      :class="{
        error: $v.$anyError || errorText !== '' || emailErrorText !== ''
      }"
      @submit.prevent="handleReserveTag($event)"
    >
      <div
        v-if="!showShareButton"
        class="input-group"
        :class="{ error: $v.tag.$error }"
      >
        <label>
          {{ $t('tag.yourTagTitle') }}
          <the-mask
            v-model.trim="tag"
            autocomplete="off"
            autofocus
            :disabled="isLoading"
            mask="$SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
            name="tag"
            :placeholder="$t('tag.yourTagPlaceholder')"
            type="text"
          />
        </label>
        <span v-if="!$v.tag.required" class="error-message">
          {{ $t('tag.errors.tag.required') }}
        </span>
        <span v-if="!$v.tag.minLength" class="error-message">
          {{
            $t('tag.errors.tag.minLength', {
              minLength: $v.tag.$params.minLength.min
            })
          }}
        </span>
        <span v-if="!$v.tag.maxLength" class="error-message">
          {{
            $t('tag.errors.tag.maxLength', {
              maxLength: $v.tag.$params.maxLength.max
            })
          }}
        </span>
        <span v-if="!$v.tag.alpha" class="error-message">
          {{ $t('tag.errors.tag.alpha') }}
        </span>
        <span v-if="!$v.tag.notSame" class="error-message">
          {{ $t('tag.errors.tag.notSame') }}
        </span>
        <p class="description">
          {{
            $t('tag.yourTagDescription', {
              minLength: $v.tag.$params.minLength.min,
              maxLength: $v.tag.$params.maxLength.max
            })
          }}
        </p>
      </div>
      <div v-else class="whats-next">
        <h2 class="title">{{ $t('tag.whatsNextTitle') }}</h2>
        <p class="description">{{ $t('tag.whatsNextDescription') }}</p>
      </div>

      <div class="actions">
        <div class="group">
          <a
            v-if="showShareButton"
            class="button primary link-button"
            :href="twitMessage"
            target="_blank"
          >
            <img
              alt="Twitter logo"
              class="twitter-logo"
              src="@/assets/images/twitter.svg"
            />
            {{ $t('tag.shareButton') }}
          </a>
          <action-button
            v-else
            ref="button"
            class="primary"
            :disabled="isLoading || tag.length < 1 || $v.$error"
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
              {{ buttonText }}
            </template>
          </action-button>
        </div>

        <div v-if="showShareButton && !showEmailInput" class="group">
          <action-button
            class="transparent icon button no-padding"
            @button-click="handleShareEmailButton"
          >
            <img alt="mail icon" src="@/assets/images/mail.svg" />
            {{ $t('tag.shareEmailButton') }}
          </action-button>

          <p class="email-description">
            {{ $t('tag.emailDescription') }}
          </p>
        </div>

        <div v-if="errorText !== ''" class="group error-message">
          {{ errorText }}
        </div>
      </div>

      <div
        v-if="showShareButton && showEmailInput"
        class="input-group email-group"
      >
        <p v-if="isEmailSaved">{{ $t('tag.emailSaved') }}</p>
        <template v-else>
          <input
            v-model.trim="email"
            autocomplete="true"
            :placeholder="$t('tag.emailPlaceHolder')"
            type="email"
          />
          <span v-if="!$v.email.isValidEmail" class="error-message">
            {{ $t('tag.errors.email.invalid') }}
          </span>
          <span v-if="emailErrorText !== ''" class="error-message">
            {{ emailErrorText }}
          </span>
          <action-button
            class="primary email-button"
            :disabled="isEmailLoading || $v.email.$error || email === ''"
            @button-click="handleSaveEmail"
          >
            <div v-if="isEmailLoading" class="loader-icon">
              <img
                :alt="$t('icon.txtPendingIconAlt')"
                src="@/assets/images/ios-spinner-white.svg"
              />
            </div>

            <template v-else>
              {{ $t('lblOK') }}
            </template>
          </action-button>
        </template>
      </div>
    </form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { TheMask } from 'vue-the-mask';
import {
  alpha,
  email,
  maxLength,
  minLength,
  not,
  required,
  sameAs
} from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

import party from 'party-js';

import { MoverAPIError } from '@/services/v2/api/mover/MoverAPIError';
import { MoverAPITagService } from '@/services/v2/api/mover/tag';
import { captureSentryException } from '@/services/v2/utils/sentry';
import { isProviderRpcError } from '@/store/modules/governance/utils';
import { reserveTagInput } from '@/store/modules/tag/types';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'TagManage',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ActionButton,
    TheMask
  },
  data() {
    return {
      tag: '',
      reservedNow: false,
      isLoading: false,
      errorText: '',

      email: '',
      emailErrorText: '',
      isEmailLoading: false,
      showEmailInput: false,
      isEmailSaved: false
    };
  },
  computed: {
    ...mapState('tag', {
      reservedTag: 'tag',
      signature: 'sig',
      tagService: 'apiService'
    }),
    showShareButton(): boolean {
      return (
        this.reservedTag !== '' &&
        this.tag === this.reservedTag &&
        this.reservedNow
      );
    },
    twitMessage(): string {
      return (
        'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(
          this.$t('tag.twit', {
            tag: this.reservedTag,
            sig: this.signature
          }) as string
        )
      );
    },
    buttonText(): string {
      if (this.tag === '') {
        return this.$t('tag.chooseTheTagButton') as string;
      }

      if (this.reservedTag === undefined) {
        return this.$t('tag.reserveTheTagButton') as string;
      }

      return this.$t('tag.changeTheTagButton') as string;
    }
  },
  mounted() {
    party.settings.gravity = 400;
    this.$watch(
      () => this.reservedTag,
      (newVal) => {
        if (newVal !== undefined) {
          this.tag = newVal;
        }
      },
      {
        immediate: true
      }
    );
  },
  methods: {
    ...mapActions('tag', ['reserveTag', 'loadInfo']),
    handleShareEmailButton(): void {
      this.showEmailInput = true;
    },
    async handleSaveEmail(): Promise<void> {
      this.emailErrorText = '';
      this.$v.email.$touch();

      try {
        this.isEmailLoading = true;
        await (this.tagService as MoverAPITagService).saveEmail(this.email);
        this.isEmailSaved = true;
      } catch (error) {
        captureSentryException(error);
        this.emailErrorText = this.$t('tag.errors.default') as string;
      } finally {
        this.isEmailLoading = false;
      }
    },
    async handleReserveTag($event: Event): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.reserveTag({
          tag: this.tag
        } as reserveTagInput);
        this.reservedNow = true;
        party.confetti($event.target as HTMLInputElement, {
          count: 75
        });
      } catch (error) {
        captureSentryException(error);

        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (error instanceof MoverAPIError) {
          if (
            error.shortMessage !== undefined &&
            this.$te(`tag.errors.${error.shortMessage}`)
          ) {
            this.errorText = this.$t(
              `tag.errors.${error.shortMessage}`
            ) as string;
            return;
          }

          if (this.$te(`tag.errors.${error.message}`)) {
            this.errorText = this.$t(`tag.errors.${error.message}`) as string;
            return;
          }
        }

        this.errorText = this.$t('tag.errors.default') as string;
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
    tag: {
      required,
      minLength: minLength(1),
      maxLength: maxLength(20),
      notSame: not(sameAs((vm) => vm.reservedTag)),
      alpha
    },
    email: {
      isValidEmail: email
    }
  }
});
</script>
