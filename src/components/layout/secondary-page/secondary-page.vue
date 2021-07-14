<template>
  <div>
    <div v-if="!hideTitle" class="heading page-secondary page-heading">
      <slot name="title">
        <h2 class="title page-title">{{ title }}</h2>
      </slot>
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
    collapseHeadingButtons: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    hideTitle: {
      type: Boolean,
      default: false
    }
  }
});
</script>
