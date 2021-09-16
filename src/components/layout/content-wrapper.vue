<template>
  <div :class="baseClass">
    <back-button v-if="hasBackButton" @close="handleBack" />
    <left-rail
      v-if="hasLeftRail"
      :container-class="leftRailClass"
      :inner-wrapper-class="leftRailInnerWrapperClass"
      :inner-wrapper-style="leftRailStyle"
    >
      <slot name="left-rail"></slot>
    </left-rail>
    <close-button
      v-if="hasCloseButton"
      :is-black="isBlackCloseButton"
      @close="handleClose"
    />

    <page-container :container-class="pageContainerClassDerived">
      <slot></slot>
    </page-container>
    <slot name="modals"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Properties } from 'csstype';

import { BackButton, CloseButton } from '@/components/buttons';
import LeftRail from './left-rail/left-rail.vue';
import PageContainer from './page-container.vue';

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
    },
    isBlackCloseButton: {
      type: Boolean,
      default: false
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
    },
    leftRailStyle(): Properties {
      if (this.hasBackButton || this.hasCloseButton) {
        return {
          paddingTop: '104px'
        };
      }
      return {};
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    },
    handleBack(): void {
      this.$emit('back');
    }
  }
});
</script>
