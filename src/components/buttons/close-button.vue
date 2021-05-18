<template>
  <action-button
    button-class="close round-icon floating right"
    @button-click="handleClick"
  >
    X
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';

import ActionButton from './action-button.vue';

export default Vue.extend({
  name: 'CloseButton',
  components: {
    ActionButton
  },
  methods: {
    handleClick() {
      this.$emit('close');
    }
  }
});
</script>

<style scoped></style>
