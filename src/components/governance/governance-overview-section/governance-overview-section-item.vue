<template>
  <li class="item">
    <h3 :class="descriptionClass">
      <slot name="description">{{ description }}</slot>
    </h3>
    <span :class="valueClass">
      <slot>{{ value }}</slot>
    </span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceOverviewSectionItem',
  props: {
    description: {
      type: String,
      default: ''
    },
    descriptionClass: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      default: ''
    },
    valueClass: {
      type: String,
      default: ''
    }
  }
});
</script>
