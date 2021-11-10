<template>
  <button
    :class="[classes]"
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
    buttonClass: {
      type: String,
      default: 'button'
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
  computed: {
    classes(): string {
      return `${this.buttonClass} ${this.disabled ? 'disabled' : ''}`;
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
