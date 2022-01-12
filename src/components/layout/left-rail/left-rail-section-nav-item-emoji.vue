<template>
  <component
    :is="containerComponent"
    :active-class="activeClass"
    class="item emoji button-like"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="navigateToRoute"
    @click="handleClick"
  >
    <div class="icon">
      <slot name="emoji">{{ emoji }}</slot>
    </div>
    <h3 class="info" :class="textClass">
      <slot>{{ text }}</slot>
    </h3>
  </component>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

import { Properties } from 'csstype';

// The component may serve as a styled plain button
//
// To achieve such behaviour one should pass an undefined to
// `navigateTo` prop and expect @click event appear
export default Vue.extend({
  name: 'LeftRailSectionNavItemEmoji',
  props: {
    navigateTo: {
      type: [String, Object] as PropType<RawLocation | undefined>,
      default: undefined
    },
    containerClass: {
      type: String,
      default: ''
    },
    containerStyles: {
      type: Object as PropType<Properties | undefined>,
      default: undefined
    },
    emoji: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    textClass: {
      type: String,
      default: ''
    },
    usePartialMatchActiveClass: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerComponent(): string {
      if (this.navigateTo === undefined) {
        return 'div';
      }

      return 'router-link';
    },
    navigateToRoute(): RawLocation | undefined {
      if (typeof this.navigateTo === 'string') {
        return { name: this.navigateTo };
      }

      return this.navigateTo;
    },
    activeClass(): string | undefined {
      if (!this.usePartialMatchActiveClass) {
        return undefined;
      }

      return 'active';
    }
  },
  methods: {
    handleClick(event: MouseEvent): void {
      if (this.navigateTo !== undefined) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      this.$emit('click');
    }
  }
});
</script>
