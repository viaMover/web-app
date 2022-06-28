<template>
  <div ref="container" class="form-progress-bar">
    <div class="runner" :style="runnerStyle" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Properties as CssProperties } from 'csstype';
import gsap from 'gsap';

export default Vue.extend({
  name: 'FormProgressBar',
  props: {
    maxValue: {
      type: Number,
      default: 100
    },
    value: {
      type: Number,
      default: 0
    },
    animationDuration: {
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      interpolatedValue: this.value
    };
  },
  computed: {
    runnerStyle(): CssProperties {
      return {
        width: `${(100 * this.interpolatedValue) / this.maxValue}%`
      };
    }
  },
  watch: {
    value: {
      handler(newVal: string | number, oldVal: string | number) {
        gsap.fromTo(
          this.$data,
          {
            interpolatedValue: oldVal
          },
          {
            duration: this.animationDuration / 1000,
            interpolatedValue: newVal
          }
        );
      },
      immediate: true
    }
  }
});
</script>
