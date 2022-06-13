<template>
  <base-button
    :class="{ 'icon-only': loading }"
    :disabled="disabled || loading || error !== undefined"
    primary
    propagate-original-event
    type="submit"
  >
    <img v-if="loading" alt="" :src="spinnerPicture.src" />
    <template v-else-if="error !== undefined">
      {{ error }}
    </template>
    <slot v-else>{{ text }}</slot>
  </base-button>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { getThemedPicture } from '@/assets/images/icons/spinner';

import { PictureDescriptor } from '@/components/html5';
import BaseButton from '@/components/v1.2/buttons/base-button.vue';

export default Vue.extend({
  name: 'SubmitButton',
  components: {
    BaseButton
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: undefined
    },
    text: {
      type: String,
      default: undefined
    }
  },
  computed: {
    ...mapState(['theme']),
    spinnerPicture(): PictureDescriptor {
      return getThemedPicture(this.theme);
    }
  }
});
</script>
