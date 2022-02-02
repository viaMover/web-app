<template functional>
  <div class="section skeleton">
    <div class="link">
      <pu-skeleton class="title" tag="h2" width="350px" />
      <pu-skeleton class="button round disabled no-padding" />
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SectionBase'
});
</script>
