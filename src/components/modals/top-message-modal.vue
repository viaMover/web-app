<template>
  <div class="top-message-wrapper" :class="[type, slideClass]">
    <div class="top-message-container">
      <div class="text">{{ text }}</div>
      <img
        :alt="$t('icon.txtCloseIconAlt')"
        class="close"
        src="@/assets/images/back_cross.svg"
        @click="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  globalEventBus,
  GlobalTopMessageEvent,
  GlobalTopMessagePayload
} from '@/global-event-bus';

import { TopMessageType } from '.';

export default Vue.extend({
  name: 'TopMessageModal',
  components: {},
  props: {
    showDuration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      text: '',
      type: 'info' as TopMessageType,
      isDisplayed: false,
      closeTimeoutId: undefined as number | undefined
    };
  },
  computed: {
    slideClass(): string {
      return this.isDisplayed ? 'slide-top-in' : '';
    }
  },
  mounted() {
    globalEventBus.$on(GlobalTopMessageEvent, this.show);
  },
  beforeDestroy() {
    globalEventBus.$off(GlobalTopMessageEvent, this.show);
  },
  methods: {
    closeModal(): void {
      window.clearTimeout(this.closeTimeoutId);
      this.isDisplayed = false;
    },
    show(payload: GlobalTopMessagePayload): void {
      this.text = payload.text;
      this.type = payload.type;
      this.isDisplayed = true;
      window.clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = window.setTimeout(() => {
        this.isDisplayed = false;
      }, this.showDuration);
    }
  }
});
</script>
