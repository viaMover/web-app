<template>
  <div class="card" :style="cardStyle">
    <span>{{ emoji }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Properties } from 'csstype';

export default Vue.extend({
  name: 'EmojiCard',
  props: {
    emoji: {
      type: String,
      default: ''
    },
    cornerColor: {
      type: String,
      default: '#000'
    }
  },
  computed: {
    cardStyle(): Record<string, string> {
      return {
        '--bgColor': this.cornerColor
      };
    }
  }
});
</script>
