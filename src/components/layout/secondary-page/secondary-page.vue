<template>
  <div class="secondary-page">
    <back-button
      v-if="hasBackButton"
      class="navigation page-back-button fixed"
      @back="handleBack"
    />
    <div v-if="!hideTitle" class="secondary-page-header">
      <slot name="title">
        <h2 class="title" :class="titleClass">{{ title }}</h2>
      </slot>
    </div>
    <div v-if="!hideInfo" class="secondary-page-info">
      <slot name="info" />
    </div>
    <div class="secondary-page-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import BackButton from '@/components/buttons/back-button.vue';

export default Vue.extend({
  name: 'SecondaryPage',
  components: { BackButton },
  props: {
    title: {
      type: String,
      default: ''
    },
    hideTitle: {
      type: Boolean,
      default: false
    },
    hideInfo: {
      type: Boolean,
      default: false
    },
    hasBackButton: {
      type: Boolean,
      default: false
    },
    titleClass: {
      type: String,
      default: undefined
    }
  },
  methods: {
    handleBack(): void {
      this.$emit('back');
    }
  }
});
</script>
