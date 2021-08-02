<template>
  <action-button
    button-class="button close-button button-active"
    @button-click="handleClick"
  >
    <img
      v-if="isBlack"
      alt="close icon"
      src="@/assets/images/black-cross.svg"
    />
    <img v-else alt="close icon" src="@/assets/images/cross.svg" />
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
  props: {
    isBlack: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      this.$emit('close');
    }
  }
});
</script>
