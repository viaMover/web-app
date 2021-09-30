<template>
  <router-link
    class="left-rail-section-nav-item button-active image"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="navigateToRoute"
  >
    <div class="image">
      <slot name="picture" />
    </div>
    <div class="info">
      <slot name="title">
        <h3 v-if="title !== ''" :class="titleClass">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p v-if="description !== ''" :class="descriptionClass">
          {{ description }}
        </p>
      </slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { Properties } from 'csstype';

import '@/styles/_left_rail_section_nav_item.less';

export default Vue.extend({
  name: 'LeftRailSectionNavItemImage',
  props: {
    navigateTo: {
      type: [String, Object] as PropType<RawLocation>,
      required: true
    },
    containerClass: {
      type: String,
      default: ''
    },
    containerStyles: {
      type: Object as PropType<Properties | undefined>,
      default: undefined
    },
    title: {
      type: String,
      default: ''
    },
    titleClass: {
      type: String,
      default: ''
    },
    description: {
      type: [String, Number],
      default: ''
    },
    descriptionClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    navigateToRoute(): RawLocation {
      if (typeof this.navigateTo === 'string') {
        return { name: this.navigateTo };
      }

      return this.navigateTo;
    }
  }
});
</script>
