<template>
  <div class="dashboard">
    <slot name="left-rail" />
    <div class="page-content" :class="pageContentClass">
      <back-button
        v-if="hasBackButton"
        class="page-back-button"
        @back="handleBack"
      />
      <close-button
        v-if="hasCloseButton"
        class="page-close-button"
        :is-black="isBlackCloseButton"
        @close="handleClose"
      />
      <main class="wrapper">
        <slot></slot>
      </main>
    </div>
    <div class="modals">
      <slot name="modals"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { BackButton, CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'ContentWrapper',
  components: {
    BackButton,
    CloseButton
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
    },
    pageContentClass: {
      type: String as PropType<string | undefined>,
      default: undefined
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
