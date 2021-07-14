<template>
  <button :class="[buttonClass]" @click.prevent.stop="handleClick">
    <template v-if="text">
      {{ text }}
    </template>
    <slot></slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ActionButton',
  props: {
    text: {
      type: String,
      required: false,
      default: ''
    },
    buttonClass: {
      type: String,
      required: false,
      default: 'button'
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
