<template>
  <div class="dashboard">
    <div class="page-content two-sided" :class="pageContentClass">
      <back-button
        v-if="hasBackButton"
        class="navigation page-back-button fixed"
        @back="handleBack"
      />
      <close-button
        v-if="hasCloseButton"
        class="navigation page-close-button fixed"
        is-black
        @close="handleClose"
      />
      <main class="wrapper">
        <div class="side left">
          <slot name="left" />
        </div>
        <div class="side right">
          <slot name="right" />
          <slot name="context-button" />
        </div>
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
  name: 'ContentWrapperTwoSided',
  components: {
    BackButton,
    CloseButton
  },
  props: {
    hasCloseButton: {
      type: Boolean,
      default: false
    },
    hasBackButton: {
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
