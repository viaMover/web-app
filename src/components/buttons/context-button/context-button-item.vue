<template>
  <li class="button-active" @click="$emit('click')">
    <span>
      <slot>{{ text }}</slot>
    </span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ContextButtonItem',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
});
</script>
