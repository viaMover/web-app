<template>
  <base-button
    :disabled="disabled || loading || error !== undefined"
    propagate-original-event
    type="submit"
  >
    <div v-if="loading" class="loader-icon">
      <img alt="" src="@/assets/images/ios-spinner-white.svg" />
    </div>
    <template v-else-if="error !== undefined">
      {{ error }}
    </template>
    <slot v-else>{{ text }}</slot>
  </base-button>
</template>

<script lang="ts">
import Vue from 'vue';

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
  }
});
</script>
