<template>
  <div class="item">
    <span class="title">
      <slot name="title">
        {{ title }}
      </slot>
    </span>
    <p class="description" :class="{ black: isBlackDescription }">
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
      type: String,
      default: ''
    },
    description: {
      type: [String, Number],
      default: ''
    },
    isBlackDescription: {
      type: Boolean,
      default: false
    }
  }
});
</script>
