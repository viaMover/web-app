<template>
  <router-link :to="navigateTo">
    <li :class="itemClass" :style="itemStyle">
      <slot>
        <emoji-card :corner-color="cornerColor" :emoji="emoji" />
      </slot>
      <div class="wrapper">
        <div class="title">{{ title }}</div>
        <div class="value">{{ description }}</div>
      </div>
    </li>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';

import { EmojiCard } from '@/components/controls';

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
    },
    navigateToName: {
      type: String,
      default: ''
    }
  },
  computed: {
    itemStyle(): Record<string, string> {
      return {
        opacity: this.disabled ? '0.5' : '1'
      };
    },
    itemClass(): string {
      if (this.disabled) {
        return this.wrapperClass;
      }

      return `button-active ${this.wrapperClass}`;
    },
    navigateTo(): Record<string, string> {
      return {
        name: this.navigateToName
      };
    }
  }
});
</script>
