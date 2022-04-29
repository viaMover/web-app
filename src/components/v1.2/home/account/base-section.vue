<template>
  <div class="section">
    <div class="link">
      <div class="heading-container">
        <slot name="heading">
          <h2 class="title">{{ headingText }}</h2>
        </slot>
        <p v-if="descriptionText" class="description">{{ descriptionText }}</p>
      </div>
      <div
        v-if="useClickEvent"
        class="navigation icon icon-only round button inherit-size"
        @click.prevent="handleClick"
      >
        <base-icon icon-class="icon-expand-section" />
      </div>
      <router-link
        v-else
        class="navigation icon icon-only round button inherit-size"
        :to="{ name: navigateToName }"
      >
        <base-icon icon-class="icon-expand-section" />
      </router-link>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { BaseIcon } from '@/components/v1.2';

export default Vue.extend({
  name: 'BaseSection',
  components: {
    BaseIcon
  },
  props: {
    hasExpandButton: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    useClickEvent: {
      type: Boolean,
      default: false
    },
    headingText: {
      type: String,
      default: undefined
    },
    descriptionText: {
      type: String,
      default: undefined
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
