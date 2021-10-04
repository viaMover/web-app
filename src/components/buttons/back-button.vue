<template>
  <action-button
    button-class="button back-link button-active"
    @button-click="handleClick"
  >
    <arrow-left-icon />
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';

import ArrowLeftIcon from '@/components/controls/arrow-left-icon.vue';

import ActionButton from './action-button.vue';

export default Vue.extend({
  name: 'BackButton',
  components: {
    ArrowLeftIcon,
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
