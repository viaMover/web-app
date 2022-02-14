<template>
  <button
    class="button"
    :class="{ disabled: disabled }"
    :disabled="disabled"
    :style="customStyle"
    :type="type"
    @click="handleClick"
  >
    <template v-if="text">
      {{ text }}
    </template>
    <slot v-else></slot>
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Properties as CssProperties } from 'csstype';

export default Vue.extend({
  name: 'ActionButton',
  props: {
    text: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customStyle: {
      type: Object as PropType<CssProperties>,
      default: undefined
    },
    type: {
      type: String,
      default: 'button'
    },
    propagateOriginalEvent: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(event: MouseEvent): void {
      if (!this.propagateOriginalEvent) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.$emit('button-click');
    }
  }
});
</script>
