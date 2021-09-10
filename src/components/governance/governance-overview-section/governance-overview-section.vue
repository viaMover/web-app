<template>
  <div class="overview-section">
    <div v-if="hasTitle" class="header">
      <slot name="header">
        <h2>{{ title }}</h2>
      </slot>
    </div>
    <div class="items-container">
      <ul>
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceOverviewSection',
  props: {
    hasTitle: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  }
});
</script>
