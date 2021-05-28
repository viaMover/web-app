<template>
  <transition name="modal">
    <div class="modal-mask">
      <close-button v-if="hasCloseButton" @close="handleClose" />
      <div v-on-clickaway="handleClose" class="modal-wrapper">
        <div class="header">
          <slot name="header"></slot>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';

import { CloseButton } from '@/components/buttons';
import { mixin as Clickaway } from 'vue-clickaway';

export default Vue.extend({
  name: 'ModalWindow',
  components: {
    CloseButton
  },
  mixins: [Clickaway],
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
