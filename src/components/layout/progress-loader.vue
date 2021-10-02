<template>
  <svg class="donut" height="100%" viewBox="0 0 36 36" width="100%">
    <circle
      class="donut-ring"
      cx="18"
      cy="18"
      fill="transparent"
      r="15.91549430918954"
      :stroke="strokeColor"
      stroke-width="2"
    ></circle>
    <circle
      class="donut-segment"
      cx="18"
      cy="18"
      fill="transparent"
      r="15.91549430918954"
      stroke="#fafafc"
      :stroke-dasharray="dashArray"
      :stroke-dashoffset="dashOffset"
      stroke-width="3"
    ></circle>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap from 'gsap';

export default Vue.extend({
  name: 'ProgressLoader',
  props: {
    isAnimated: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      default: 0
    },
    strokeColor: {
      type: String,
      default: '#000'
    },
    animationDuration: {
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      renderedValue: 0
    };
  },
  computed: {
    source(): number {
      return this.isAnimated ? this.renderedValue : this.value;
    },
    dashArray(): string {
      return `${String(100 - this.source)} ${String(this.source)}`;
    },
    dashOffset(): string {
      return String(25 - this.source);
    }
  },
  watch: {
    value: {
      handler(newValue: number) {
        gsap.to(this.$data, {
          duration: this.animationDuration / 1000,
          renderedValue: newValue
        });
      },
      immediate: true
    }
  }
});
</script>
