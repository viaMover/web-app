<template>
  <button
    :class="[classes]"
    :disabled="disabled"
    :style="customStyle"
    @click.prevent.stop="handleClick"
  >
    <template v-if="text">
      {{ text }}
    </template>
    <slot></slot>
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
    }
  },
  computed: {
    classes(): string {
      return `${this.buttonClass} ${this.disabled ? 'disabled' : ''}`;
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
