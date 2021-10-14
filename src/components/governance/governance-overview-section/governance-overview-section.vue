<template>
  <div>
    <div v-if="hasTitle">
      <slot name="header">
        <h2 class="subtitle">{{ title }}</h2>
      </slot>
    </div>
    <div class="overview__wrapper-items">
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
