<template>
  <router-link
    class="left-rail-section-nav-item button-active emoji"
    :class="containerClass"
    exact-active-class="active"
    :style="containerStyles"
    :to="{ name: this.navigateToName }"
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

export default Vue.extend({
  name: 'LeftRailSectionNavItemEmoji',
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
  }
});
</script>
