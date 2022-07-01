<template>
  <secondary-page class="manage set-email">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('tag.reserveTagDescription')"
        :title="$t('tag.reserveTagTitle')"
      />
    </template>

    <form
      class="form info"
      :class="{ error: $v.$anyError || errorText !== '' }"
      @submit.prevent="handleReserveTag"
    >
      <div class="input-group" :class="{ error: $v.tag.$error }">
        <label>
          {{ $t('tag.yourTagTitle') }}
          <input
            v-model.trim="tag"
            autocomplete="off"
            autofocus
            :disabled="isLoading"
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
        <p class="description">
          {{
            $t('tag.yourTagDescription', {
              minLength: $v.tag.$params.minLength.min,
              maxLength: $v.tag.$params.maxLength.max
            })
          }}
        </p>
      </div>

      <div class="actions">
        <div class="group default">
          <action-button
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

        <div v-if="errorText !== ''" class="group error-message">
          {{ errorText }}
        </div>
      </div>
    </form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  alpha,
  maxLength,
  minLength,
  required
} from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

import { MoverAPIError } from '@/services/v2/api/mover/MoverAPIError';
import { isProviderRpcError } from '@/store/modules/governance/utils';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'TagManage',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ActionButton
  },
  data() {
    return {
      tag: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('tag', {
      reservedTag: 'tag'
    }),
    buttonText(): string {
      if (this.tag === '') {
        return this.$t('tag.chooseTheTagButton') as string;
      }

      if (this.reservedTag !== '' && this.tag === this.reservedTag) {
        return this.$t('tag.shareButton') as string;
      }

      return this.$t('tag.reserveTheTagButton') as string;
    }
  },
  mounted() {
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
    async handleReserveTag(): Promise<void> {
      if (this.reservedTag !== '' && this.tag === this.reservedTag) {
        // TODO: add share logic
        console.log('Share in Twitter');
        return;
      }

      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.scrollButtonIntoView();
        return;
      }

      try {
        this.isLoading = true;
        await this.reserveTag(this.tag);
      } catch (error) {
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
      minLength: minLength(2),
      maxLength: maxLength(20),
      alpha
    }
  }
});
</script>
