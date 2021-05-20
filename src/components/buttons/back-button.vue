<template>
  <action-button
    button-class="close round-icon floating left"
    @button-click="handleClick"
  >
    &lt;
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';

import ActionButton from './action-button.vue';

export default Vue.extend({
  name: 'BackButton',
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
