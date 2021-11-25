<template>
  <div class="dashboard">
    <back-button
      v-if="hasBackButton"
      class="page-back-button"
      @close="handleBack"
    />
    <slot name="left-rail" />
    <back-button
      v-if="hasCloseButton"
      class="page-close-button"
      :mode="isBlackCloseButton ? 'CLOSE-BLACK' : 'CLOSE'"
      @close="handleClose"
    />
    <div class="page-content" :class="pageContentClass">
      <main class="wrapper">
        <slot></slot>
      </main>
    </div>
    <slot name="modals"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Properties } from 'csstype';

import { BackButton } from '@/components/buttons';

export default Vue.extend({
  name: 'ContentWrapper',
  components: {
    BackButton
  },
  props: {
    hasLeftRail: {
      type: Boolean,
      default: false
    },
    hasCloseButton: {
      type: Boolean,
      default: false
    },
    hasBackButton: {
      type: Boolean,
      default: false
    },
    isBlackCloseButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleBack(): void {
      this.$emit('back');
    },
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
