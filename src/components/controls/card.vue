<template>
  <div v-if="!closed" :class="wrapperClass">
    <div class="card__info">
      <div class="card__info-description">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="card__info-icon">
        <span>{{ icon }}</span>
      </div>
    </div>
    <div class="card__buttons">
      <action-button
        class="black-link button-active"
        @button-click="handleBtnClick"
      >
        {{ btnText }}
      </action-button>
      <close-button
        :is-black="isBlackCloseBtn"
        @close="handleCloseBtn"
      ></close-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { ActionButton, CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'Card',
  components: {
    ActionButton,
    CloseButton
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    btnText: {
      type: String,
      default: ''
    },
    closed: {
      type: Boolean,
      default: false
    },
    isBlackCloseBtn: {
      type: Boolean,
      default: false
    },
    wrapperClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleCloseBtn(): void {
      this.$emit('close');
    },
    handleBtnClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
