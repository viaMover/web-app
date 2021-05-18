<template>
  <div class="content-wrapper">
    <left-rail v-if="hasLeftRail">
      <slot name="left-rail"></slot>
    </left-rail>

    <page-container>
      <close-button v-if="hasCloseButton" @close="handleClose" />
      <slot></slot>
    </page-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import LeftRail from './left-rail.vue';
import PageContainer from './page-container.vue';
import CloseButton from '@/components/buttons/close-button.vue';

export default Vue.extend({
  name: 'ContentWrapper',
  components: {
    PageContainer,
    LeftRail,
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
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
