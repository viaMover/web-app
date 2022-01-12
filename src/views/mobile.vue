<template>
  <content-wrapper class="dashboard dashboard-mobile mobile centered">
    <a
      class="logo button-like"
      href="https://viamover.com/"
      rel="external"
      target="_blank"
    >
      <img alt="logo" src="@/assets/images/logo.svg" />
    </a>
    <div class="gif">
      <video
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        src="@/assets/videos/welcome.webm"
      />
    </div>

    <div class="description">
      <h1>{{ $t('lblDashboardMobile') }}</h1>
      <p>{{ $t('txtDashboardMobile') }}</p>

      <a class="button primary" href="https://viamover.com/" rel="external">
        {{ $t('btnDashboardMobile') }}
      </a>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'Mobile',
  components: {
    ContentWrapper
  }
});
</script>
