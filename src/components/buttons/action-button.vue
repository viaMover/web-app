<template>
  <button
    :class="[buttonClass]"
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
  methods: {
    handleClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
