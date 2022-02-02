<template>
  <div class="item">
    <span class="title">
      <slot name="title">
        {{ title }}
      </slot>
    </span>
    <p class="description">
      <slot>
        {{ description }}
      </slot>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ProductInfoItem',
  props: {
    title: {
      type: [String, Number],
      default: ''
    },
    description: {
      type: [String, Number],
      default: ''
    }
  }
});
</script>
