<template>
  <div :class="baseClass">
    <left-rail
      v-if="hasLeftRail"
      :container-class="leftRailClass"
      :inner-wrapper-class="leftRailInnerWrapperClass"
      :show-logo="!hasBackButton"
    >
      <slot name="left-rail"></slot>
      <back-button v-if="hasBackButton" @close="handleClose" />
      <close-button v-if="hasCloseButton" @close="handleClose" />
    </left-rail>
    <template v-else>
      <back-button v-if="hasBackButton" @close="handleClose" />
      <close-button v-if="hasCloseButton" @close="handleClose" />
    </template>

    <page-container :container-class="pageContainerClassDerived">
      <slot></slot>
    </page-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import LeftRail from './left-rail/left-rail.vue';
import PageContainer from './page-container.vue';
import { BackButton, CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'ContentWrapper',
  components: {
    PageContainer,
    LeftRail,
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
    baseClass: {
      type: String,
      default: 'info__wrapper'
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    leftRailInnerWrapperClass: {
      type: String,
      default: ''
    },
    pageContainerClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    leftRailClass(): string {
      return this.wrapperClass + '__sidebar';
    },
    pageContainerClassDerived(): string {
      if (!this.pageContainerClass) {
        return this.wrapperClass + '__menu';
      }

      return [this.wrapperClass + '__menu', this.pageContainerClass].join(' ');
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
