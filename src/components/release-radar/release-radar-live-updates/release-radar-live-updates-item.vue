<template>
  <div class="swiper-slide">
    <router-link class="live-updates__item" :to="{ name: navigateToName }">
      <div class="live-updates__item-icon">
        <span class="button-active">
          <slot name="icon">{{ icon }}</slot>
        </span>
      </div>
      <div class="live-updates__item-title">
        <p>
          <slot>{{ title }}</slot>
        </p>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ReleaseRadarLiveUpdatesItem',
  props: {
    navigateToName: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
});
</script>
