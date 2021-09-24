<template>
  <div class="secondary-page-wrapper">
    <back-button v-if="hasBackButton" @close="handleBack" />
    <div v-if="!hideTitle" class="heading page-secondary page-heading">
      <slot name="title">
        <h2 class="title page-title">{{ title }}</h2>
      </slot>
    </div>
    <div class="page-body">
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
    hasBackButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleBack(): void {
      this.$emit('back');
    }
  }
});
</script>
