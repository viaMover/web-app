<template>
  <action-button class="round" @button-click="handleClick">
    <base-icon v-once icon-class="icon-close" />
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';

import { BaseIcon } from '@/components/v1.2';

import ActionButton from './action-button.vue';

export default Vue.extend({
  name: 'CloseButton',
  components: {
    ActionButton,
    BaseIcon
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
