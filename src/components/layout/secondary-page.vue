<template>
  <div class="page page-secondary">
    <div class="heading page-secondary page-heading">
      <h2 class="title page-title">{{ title }}</h2>
      <div v-if="hasHeadingButtons">
        <slot name="heading-buttons"></slot>
      </div>
    </div>
    <div class="page-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SecondaryPage',
  props: {
    hasHeadingButtons: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    }
  }
});
</script>
