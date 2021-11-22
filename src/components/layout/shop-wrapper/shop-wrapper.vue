<template>
  <div class="shop__wrapper">
    <div class="shop__wrapper-info">
      <slot name="info"></slot>
    </div>
    <div class="shop__wrapper-illustration">
      <slot name="illustration"></slot>
    </div>
    <back-button
      v-if="hasCloseButton"
      mode="CLOSE-BLACK"
      @close="handleClose"
    />
    <slot name="context-menu"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { BackButton } from '@/components/buttons';

import '@/styles/_shop.less';

export default Vue.extend({
  name: 'ShopWrapper',
  components: {
    BackButton
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
