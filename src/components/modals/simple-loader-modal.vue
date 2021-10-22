<template>
  <div class="modal" name="simple-loader" role="dialog">
    <div
      v-show="isDimmerVisible"
      class="modal__dimmer"
      @click="handleDimmerClick"
    />
    <back-button
      v-if="showCloseButton"
      class="modal__close-button"
      mode="CLOSE-BLACK"
      @close="handleClose"
    />
    <div class="modal__body">
      <div class="modal__body-header"></div>
      <div class="modal__body-content">
        <form-loader v-if="loaderStep != undefined" :step="loaderStep" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { BackButton } from '@/components/buttons';
import { FormLoader } from '@/components/forms';

export default Vue.extend({
  name: 'SimpleLoaderModal',
  components: {
    BackButton,
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

<style scoped lang="less">
.modal {
  &__dimmer {
    background: rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 40;
  }

  &__close-button {
    z-index: 41;
    cursor: pointer;
    width: 40px;
    height: 40px;
    background: #fcfcfc;
    -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-radius: 20px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    position: fixed;
  }

  &__body {
    z-index: 41;
    position: fixed;
    top: 104px;
    left: calc(50% - 264px);
    width: 528px;
    min-height: 30vh;
    height: auto;
    max-height: 80vh;
    padding: 0px;
    background-color: #fafafc;
    -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-radius: 16px;

    &.no-bottom-padding {
      padding-bottom: 0;
    }

    &-header {
      margin: 24px 24px 0 24px;

      &--default {
        font-family: Regular, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;
        text-align: center;
      }
    }

    &-footer {
      margin-top: 24px;
    }
  }
}
</style>
