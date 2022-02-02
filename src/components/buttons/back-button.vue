<template>
  <action-button class="button round" @button-click="handleClick">
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
