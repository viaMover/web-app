<template>
  <div class="module manage">
    <nav class="heading links">
      <ul class="items">
        <slot name="navigation" />
      </ul>
    </nav>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ModuleManage'
});
</script>
