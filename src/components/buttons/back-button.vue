<template>
  <action-button
    button-class="button back-link button-active"
    @button-click="handleClick"
  >
    <img alt="back link icon" src="@/assets/images/back-link.svg" />
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
