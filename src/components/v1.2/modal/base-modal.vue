<template>
  <div v-if="isOpened" class="modal-wrapper">
    <close-button class="close" @click="handleClose" />
    <div
      v-on-clickaway="handleClickAway"
      class="modal"
      :class="{ 'add-hr': addHr }"
    >
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

import CloseButton from '@/components/v1.2/buttons/close-button.vue';

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
    },
    addHr: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      allowClickAwayDirective: false
    };
  },
  watch: {
    isOpened: {
      handler(isOpened: boolean) {
        if (isOpened) {
          window.setTimeout(() => {
            // debounce directive firing by shifting the
            // allowClickAwayDirective set/reset in time
            this.allowClickAwayDirective = true;
          }, 100);
        }

        if (isOpened && this.lockBody) {
          this.applyNoScrollToHtml(true);
          return;
        }

        if (!isOpened) {
          this.applyNoScrollToHtml(false);
          this.allowClickAwayDirective = false;
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
    handleClickAway(): void {
      if (this.allowClickAwayDirective) {
        this.handleClose();
      }
    },
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
