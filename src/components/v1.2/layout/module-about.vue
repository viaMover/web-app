<template>
  <div class="module about">
    <div class="heading">
      <p class="title">{{ title }}</p>
      <h1 class="description">{{ description }}</h1>
    </div>

    <div class="container">
      <nav class="links">
        <ul class="items">
          <slot name="links" />
        </ul>
      </nav>
      <div class="info">
        <slot name="info" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ModuleAbout',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }
});
</script>
