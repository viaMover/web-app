<template>
  <div class="page-sidebar-wrapper-item">
    <h3>
      <slot name="section-name">{{ sectionName }}</slot>
    </h3>
    <ul>
      <slot></slot>
    </ul>
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
    }
  }
});
</script>
