<template>
  <component
    :is="htmlElement"
    :class="[{ active: isActive, inactive: disabled }, actionClasses]"
    @click="click(toggleId)"
    @mouseenter="mouseenter(toggleId)"
    @mouseleave="mouseleave()"
  >
    <slot />
  </component>
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

import toggleEventBus, {
  subToggle,
  TogglePayload,
  unsubToggle
} from './toggle-root';
import { isMobileDevice } from '@/utils/commonHelpers';

export default Vue.extend({
  name: 'ToggleAction',
  props: {
    toggleId: { type: String, required: true },
    toggleGroup: { type: String, required: true },
    lockBody: { type: Boolean, default: true },
    hover: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    htmlClass: { type: String, default: '' },
    delay: { type: Number, default: 0 },
    previousToggledItem: { type: String, default: '' },
    htmlElement: { type: String, default: 'div' }
  },
  data() {
    return {
      isActive: false,
      show: undefined as number | undefined
    };
  },
  computed: {
    actionClasses(): string {
      return this.htmlClass !== '' ? this.htmlClass : '';
    },
    hoverEvent(): boolean {
      return !isMobileDevice() && this.hover;
    }
  },
  mounted() {
    subToggle(this.toggleGroup, this.toggle);
  },
  beforeDestroy() {
    unsubToggle(this.toggleGroup, this.toggle);
  },
  methods: {
    click(toggleId: string): void {
      if (this.hover && !isMobileDevice()) {
        return;
      }

      if (!this.disabled) {
        toggleEventBus.$emit(`toggle-${this.toggleGroup}`, toggleId);
      }
    },
    mouseenter(toggleId: string): void {
      if (!this.hover || isMobileDevice()) {
        return;
      }

      if (!this.disabled) {
        this.show = window.setTimeout(() => {
          if (this.previousToggledItem !== toggleId) {
            toggleEventBus.$emit(`toggle-${this.toggleGroup}`, toggleId);
            toggleEventBus.$emit('toggle-prev-item', toggleId);
          }
        }, this.delay);
      }
    },
    mouseleave(): void {
      if (!this.hover || isMobileDevice()) {
        return;
      }

      window.clearTimeout(this.show);
    },
    toggle(payload: TogglePayload<void>): void {
      if (this.toggleId === payload.id) {
        this.isActive = !this.isActive;
      } else {
        this.isActive = false;
      }
    }
  }
});
</script>
