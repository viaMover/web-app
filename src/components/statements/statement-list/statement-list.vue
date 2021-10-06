<template>
  <div class="statements-list">
    <h1 v-if="title !== ''" class="list-title">
      <slot name="title">{{ title }}</slot>
    </h1>
    <p v-if="description !== ''" class="list-description">
      <slot name="description">{{ description }}</slot>
    </p>
    <ul :class="wrapperClass">
      <slot></slot>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'StatementList',
  props: {
    wrapperClass: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  }
});
</script>
