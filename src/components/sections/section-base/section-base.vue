<template>
  <section :name="name">
    <div :class="containerClass">
      <h2>
        <slot name="heading"></slot>
      </h2>
      <section-base-link
        v-if="hasExpandButton"
        :navigate-to-name="navigateToName"
        :use-click-event="useClickEvent"
        @navigation-click="handleClick"
      />
      <slot></slot>
    </div>
    <slot name="bottom"></slot>
  </section>
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
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
