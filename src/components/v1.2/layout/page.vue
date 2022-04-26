<template>
  <div class="dashboard">
    <back-button
      v-if="hasBackButton"
      class="page-back-button"
      @back="handleBack"
    />
    <close-button
      v-if="hasCloseButton"
      class="page-close-button"
      is-black
      @close="handleClose"
    />
    <main v-if="twoSided" class="wrapper two-sided">
      <div class="side left">
        <slot name="left" />
      </div>
      <div class="side right">
        <slot name="right" />
      </div>
    </main>
    <main v-else class="wrapper">
      <slot></slot>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { BackButton, CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'Page',
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
    twoSided: {
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
