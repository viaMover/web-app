<template>
  <action-button button-class="button close-button" @button-click="handleClick">
    <img alt="close icon" src="@/assets/images/cross.svg" />
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
