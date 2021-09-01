<template>
  <div :class="containerClass">
    <div class="item__link">
      <slot name="heading">
        <h2 class="title">{{ headingText }}</h2>
      </slot>
      <section-base-link
        v-if="hasExpandButton"
        :navigate-to-name="navigateToName"
        :use-click-event="useClickEvent"
        @navigation-click="handleClick"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import SectionBaseLink from './section-base-link.vue';

export default Vue.extend({
  name: 'SectionBase',
  components: {
    SectionBaseLink
  },
  props: {
    hasExpandButton: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    useClickEvent: {
      type: Boolean,
      default: false
    },
    containerClass: {
      type: String,
      required: true
    },
    headingText: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
