<template>
  <div class="release-radar-desktop__menu-wrapper-item">
    <slot name="title">
      <h2>{{ title }}</h2>
    </slot>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ReleaseRadarPageSection',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
});
</script>
