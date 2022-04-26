<template>
  <action-button class="button round" @button-click="handleClick">
    <base-icon icon-class="icon-back" />
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';

import { BaseIcon } from '@/components/v1.2';

import ActionButton from './action-button.vue';

export default Vue.extend({
  name: 'BackButton',
  components: {
    BaseIcon,
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
      this.$emit('back');
    }
  }
});
</script>
