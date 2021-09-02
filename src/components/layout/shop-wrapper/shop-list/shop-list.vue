<template>
  <ul class="info__items">
    <slot />
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ShopList'
});
</script>
