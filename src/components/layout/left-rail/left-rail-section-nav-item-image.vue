<template>
  <router-link
    class="left-rail-section-nav-item button-active image"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="{ name: this.navigateToName }"
  >
    <div class="image">
      <slot name="picture" />
    </div>
    <div class="info">
      <slot name="title">
        <h3 :class="titleClass">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p :class="descriptionClass">{{ description }}</p>
      </slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Properties } from 'csstype';

import '@/styles/_left_rail_section_nav_item.less';

export default Vue.extend({
  name: 'LeftRailSectionNavItemImage',
  props: {
    navigateToName: {
      type: String,
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
  }
});
</script>
