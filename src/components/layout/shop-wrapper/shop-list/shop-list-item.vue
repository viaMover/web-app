<template>
  <li class="items__item">
    <slot>
      <p>{{ title }}</p>
      <span>{{ value }}</span>
    </slot>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ShopList',
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    }
  }
});
</script>
