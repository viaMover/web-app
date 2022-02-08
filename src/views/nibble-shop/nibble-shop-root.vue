<template>
  <transition mode="out-in" name="slide">
    <router-view />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NibbleShopRoot'
});
</script>
