<template>
  <li class="button-active" @click="$emit('click')">
    <slot>
      <span>{{ text }}</span>
    </slot>
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
