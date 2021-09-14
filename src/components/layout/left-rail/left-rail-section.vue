<template>
  <div class="page-sidebar-wrapper-item">
    <h3>
      <slot name="section-name">{{ sectionName }}</slot>
    </h3>
    <component :is="itemsContainerTag" :class="itemsContainerClass">
      <slot></slot>
    </component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'LeftRailSection',
  props: {
    sectionName: {
      type: String,
      default: ''
    },
    itemsContainerTag: {
      type: String,
      default: 'ul',
      validator: (tag) => ['div', 'ul'].includes(tag)
    },
    itemsContainerClass: {
      type: String,
      default: ''
    }
  }
});
</script>
