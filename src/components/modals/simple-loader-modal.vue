<template>
  <div class="modal" role="dialog">
    <div v-show="isDimmerVisible" class="dimmer" @click="handleDimmerClick" />
    <close-button
      v-if="showCloseButton"
      class="close-button"
      @close="handleClose"
    />
    <div class="body">
      <div class="header"></div>
      <div class="content">
        <form-loader v-if="loaderStep !== undefined" :step="loaderStep" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { CloseButton } from '@/components/buttons';
import { FormLoader } from '@/components/forms';

export default Vue.extend({
  name: 'SimpleLoaderModal',
  components: {
    CloseButton,
    FormLoader
  },
  props: {
    showCloseButton: {
      type: Boolean,
      default: false
    },
    disableDimmer: {
      type: Boolean,
      default: false
    },
    loaderStep: {
      type: String,
      default: 'Confirm'
    }
  },
  computed: {
    isDimmerVisible(): boolean {
      return !this.disableDimmer;
    }
  },
  methods: {
    async handleClose(): Promise<void> {
      this.$emit('close');
    },
    async handleDimmerClick(): Promise<void> {
      await this.handleClose();
    }
  }
});
</script>
