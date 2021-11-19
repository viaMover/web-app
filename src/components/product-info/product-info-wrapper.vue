<template>
  <div class="product-info-wrapper" :class="{ short: isShort }">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ProductInfoWrapper',
  props: {
    isShort: {
      type: Boolean,
      default: false
    }
  }
});
</script>
