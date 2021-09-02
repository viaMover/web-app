<template>
  <button
    :class="[buttonClass]"
    :disabled="disabled"
    type="button"
    @click.prevent.stop="handleClick"
  >
    <slot>
      <span class="icon">{{ emoji }}</span>
      <span class="description">{{ text }}</span>
    </slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'EmojiTextButton',
  props: {
    text: {
      type: String,
      default: ''
    },
    emoji: {
      type: String,
      default: ''
    },
    buttonClass: {
      type: String,
      required: false,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
