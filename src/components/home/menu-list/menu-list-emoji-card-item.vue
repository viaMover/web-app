<template>
  <li :class="wrapperClass" :style="itemStyle">
    <slot>
      <emoji-card :corner-color="cornerColor" :emoji="emoji" />
    </slot>
    <div class="wrapper">
      <div class="title">{{ title }}</div>
      <div class="value">{{ description }}</div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

import EmojiCard from '@/components/controls/emoji-card.vue';

export default Vue.extend({
  name: 'MenuListEmojiCardItem',
  components: { EmojiCard },
  props: {
    emoji: {
      type: String,
      default: ''
    },
    cornerColor: {
      type: String,
      default: '#000'
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    itemStyle(): Record<string, string> {
      return {
        opacity: this.disabled ? '0.5' : '1'
      };
    }
  }
});
</script>
