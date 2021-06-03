<template>
  <div class="section balance">
    <span class="mainLabel">$154,849.94</span>
    <span class="description">{{ $t('headingBalance') }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HeaderBalance'
});
</script>
