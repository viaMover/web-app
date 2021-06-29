<template>
  <div :class="[wrapperClass]">
    <left-rail v-if="hasLeftRail" :container-class="leftRailClass">
      <slot name="left-rail"></slot>
    </left-rail>

    <page-container :container-class="pageContainerClass">
      <close-button v-if="hasCloseButton" @close="handleClose" />
      <back-button v-if="hasBackButton" @close="handleClose" />
      <slot></slot>
    </page-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import LeftRail from './left-rail.vue';
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
    wrapperClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    leftRailClass(): string {
      return this.wrapperClass + '__sidebar';
    },
    pageContainerClass(): string {
      return this.wrapperClass + '__menu';
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
