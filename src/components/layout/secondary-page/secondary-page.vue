<template>
  <div class="secondary-page">
    <back-button
      v-if="hasBackButton"
      class="page-back-button fixed"
      @back="handleBack"
    />
    <slot name="title" />
    <slot name="info" />
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
