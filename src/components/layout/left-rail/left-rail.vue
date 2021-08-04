<template>
  <div class="info__wrapper-sidebar" :class="[containerClass]">
    <div class="sidebar-wrapper" :style="innerWrapperStyle">
      <div :class="[contentWrapperClass, innerWrapperClass]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'LeftRail',
  props: {
    containerClass: {
      type: String,
      required: true
    },
    innerWrapperClass: {
      type: String,
      required: true
    },
    innerWrapperStyle: {
      type: Object as PropType<Record<string, string>>,
      default: {}
    }
  },
  computed: {
    contentWrapperClass(): string {
      return `${this.containerClass}-wrapper`;
    }
  }
});
</script>
