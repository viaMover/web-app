<template>
  <div v-if="isOpened" class="modal-wrapper">
    <close-button class="close" @close="handleClose" />
    <div v-on-clickaway="handleClose" class="modal">
      <div v-if="!hideHeading" class="heading">
        <slot name="heading" />
      </div>
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mixin as ClickAwayMixin } from 'vue-clickaway';

import CloseButton from '@/components/buttons/close-button.vue';

export default Vue.extend({
  name: 'BaseModal',
  components: { CloseButton },
  mixins: [ClickAwayMixin],
  props: {
    isOpened: {
      type: Boolean,
      default: false
    },
    hideHeading: {
      type: Boolean,
      default: false
    },
    lockBody: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    isOpened: {
      handler(isOpened: boolean) {
        if (isOpened && this.lockBody) {
          this.applyNoScrollToHtml(true);
          return;
        }

        if (!isOpened) {
          this.applyNoScrollToHtml(false);
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.lockBody) {
      this.applyNoScrollToHtml(false);
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    },
    applyNoScrollToHtml(value: boolean): void {
      if (value) {
        window.document.documentElement.classList.add('no-scroll');
        return;
      }

      window.document.documentElement.classList.remove('no-scroll');
    }
  }
});
</script>
