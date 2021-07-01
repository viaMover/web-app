<template>
  <div class="page page-secondary">
    <div class="heading page-secondary page-heading">
      <h2 class="title page-title">{{ title }}</h2>
      <context-button
        v-if="hasHeadingButtons && collapseHeadingButtons"
        :popover-parent-id="popoverParentId"
      >
        <slot name="heading-buttons"></slot>
      </context-button>
      <div v-else-if="hasHeadingButtons">
        <slot name="heading-buttons"></slot>
      </div>
    </div>
    <div class="page-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ContextButton } from '@/components/buttons';

export default Vue.extend({
  name: 'SecondaryPage',
  components: { ContextButton },
  props: {
    hasHeadingButtons: {
      type: Boolean,
      default: false
    },
    collapseHeadingButtons: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      required: true
    }
  },
  computed: {
    popoverParentId(): string {
      return this.title + '-action-buttons';
    }
  }
});
</script>
