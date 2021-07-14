<template>
  <div :class="wrapperClass">
    <div class="title">
      <slot name="icon">
        <div class="icon">
          <span>{{ icon }}</span>
        </div>
      </slot>
      <slot name="title">
        <h2>{{ title }}</h2>
      </slot>
    </div>
    <slot name="context-menu"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SecondaryPageTitle',
  props: {
    wrapperClass: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
});
</script>
