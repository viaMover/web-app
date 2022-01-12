<template>
  <section class="group">
    <h2 v-if="!hideHeader" class="header">
      <slot name="section-name">{{ sectionName }}</slot>
    </h2>
    <ul class="items">
      <slot></slot>
    </ul>
  </section>
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
    hideHeader: {
      type: Boolean,
      default: false
    }
  }
});
</script>
