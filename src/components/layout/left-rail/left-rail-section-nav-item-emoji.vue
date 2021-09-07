<template>
  <router-link
    class="left-rail-section-nav-item button-active emoji"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="navigateToRoute"
  >
    <div class="emoji">
      <slot name="emoji">
        <span>{{ emoji }}</span>
      </slot>
    </div>
    <div class="info">
      <slot>
        <p :class="textClass">{{ text }}</p>
      </slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Properties } from 'csstype';

import '@/styles/_left_rail_section_nav_item.less';
import { RawLocation } from 'vue-router';

export default Vue.extend({
  name: 'LeftRailSectionNavItemEmoji',
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
