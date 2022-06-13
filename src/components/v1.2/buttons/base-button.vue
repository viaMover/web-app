<template>
  <button
    class="button"
    :class="{ disabled: disabled, primary: primary }"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'BaseButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    primary: {
      type: Boolean,
      default: false
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
      this.$emit('click');
    }
  }
});
</script>
