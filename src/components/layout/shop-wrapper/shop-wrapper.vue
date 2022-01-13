<template>
  <div class="shop__wrapper">
    <div class="shop__wrapper-info">
      <slot name="info"></slot>
    </div>
    <div class="shop__wrapper-illustration">
      <slot name="illustration"></slot>
    </div>
    <close-button v-if="hasCloseButton" @close="handleClose" />
    <slot name="context-menu"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { CloseButton } from '@/components/buttons';

import '@/styles/_shop.less';

export default Vue.extend({
  name: 'ShopWrapper',
  components: {
    CloseButton
  },
  props: {
    hasCloseButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
