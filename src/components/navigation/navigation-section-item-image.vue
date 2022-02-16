<template>
  <router-link
    :active-class="activeClass"
    class="item picture button-like"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="navigateToRoute"
  >
    <slot name="picture" />
    <div class="info">
      <slot name="title">
        <h3 v-if="title !== ''" class="title" :class="titleClass">
          {{ title }}
        </h3>
      </slot>
      <slot name="description">
        <div
          v-if="description !== ''"
          class="description"
          :class="descriptionClass"
        >
          {{ description }}
        </div>
      </slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

import { Properties } from 'csstype';

export default Vue.extend({
  name: 'NavigationSectionItemImage',
  props: {
    navigateTo: {
      type: [String, Object] as PropType<RawLocation>,
      required: true
    },
    containerClass: {
      type: String,
      default: undefined
    },
    containerStyles: {
      type: Object as PropType<Properties | undefined>,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    },
    description: {
      type: [String, Number],
      default: undefined
    },
    descriptionClass: {
      type: String,
      default: undefined
    },
    usePartialMatchActiveClass: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    navigateToRoute(): RawLocation {
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
  }
});
</script>
