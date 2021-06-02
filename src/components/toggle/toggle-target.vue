<template>
  <div v-if="toggleType === 'hide'" v-show="isActive">
    <slot />
  </div>
  <div v-else-if="isActive">
    <slot />
  </div>
</template>

<script lang="ts">
//
// Example usage:
// <toggle-action :toggle-id="paymentOption.id"
//                toggle-group="payment-option">
// Click me to open the target
// </toggle-action>
// <toggle-target :toggle-id="paymentOption.id"
//                toggle-group="payment-option">
// show and hide me...
// </toggle-target>
//
import Vue from 'vue';

import toggleEventBus, { TogglePayload } from './toggle-root';

export default Vue.extend({
  name: 'ToggleTarget',
  props: {
    toggleId: { type: String, required: true },
    toggleGroup: { type: String, required: true },
    toggleType: { type: String, default: '' }, // to use v-if or v-hide as hiding method
    lockBody: { type: Boolean, default: true },
    htmlClass: { type: String, default: '' },
    menuClass: { type: String, default: '' },
    openByDefault: { type: Boolean, default: false }
  },
  data() {
    return {
      isActive: this.openByDefault
    };
  },
  mounted() {
    toggleEventBus.$on(`toggle-${this.toggleGroup}`, this.toggle);

    if (this.isActive) {
      this.applyParameters();
    }
  },
  beforeDestroy() {
    toggleEventBus.$off(`toggle-${this.toggleGroup}`, this.toggle);
  },
  methods: {
    toggle({ toggleId, payload }: TogglePayload): void {
      if (this.toggleId === toggleId) {
        this.isActive = !this.isActive;
      } else {
        this.isActive = false;
      }
      this.applyParameters();

      if (payload !== undefined && toggleId === this.toggleId) {
        this.$emit('toggle', payload);
      }
    },
    applyParameters(): void {
      if (this.lockBody) {
        document.querySelector('body')?.classList.toggle('no-scroll');
      }
      if (this.htmlClass !== '') {
        document.querySelector('html')?.classList.toggle(this.htmlClass);
      }
      if (this.menuClass !== '') {
        document.querySelector('nav .menu')?.classList.add('fluid');
      }
    }
  }
});
</script>
