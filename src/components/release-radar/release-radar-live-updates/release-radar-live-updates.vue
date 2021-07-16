<template>
  <release-radar-page-section>
    <template v-slot:title>
      <div class="release-radar-desktop__menu-wrapper-item-title">
        <h2>Live updates</h2>
      </div>
    </template>

    <swiper
      allow-touch-move
      container-class="live-updates"
      grab-cursor
      loop
      mousewheel
      :slides-per-view="4.43"
      :space-between="40"
      use-navigation-buttons
    >
      <release-radar-live-updates-item
        icon="🔥"
        navigate-to-name="home"
        title="Top movers"
      />
      <release-radar-live-updates-item
        icon="💩"
        navigate-to-name="home"
        title="Top losers"
      />
      <release-radar-live-updates-item
        icon="🐵"
        navigate-to-name="home"
        title="New tokens"
      />
      <release-radar-live-updates-item
        icon="🎢"
        navigate-to-name="home"
        title="DeFi"
      />
      <release-radar-live-updates-item
        icon="💵"
        navigate-to-name="home"
        title="Stablecoins"
      />
    </swiper>
  </release-radar-page-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { Swiper } from '@/components/swiper';
import ReleaseRadarPageSection from '../release-radar-page-section.vue';
import ReleaseRadarLiveUpdatesItem from './release-radar-live-updates-item.vue';

export default Vue.extend({
  name: 'ReleaseRadarLiveUpdates',
  components: { ReleaseRadarPageSection, ReleaseRadarLiveUpdatesItem, Swiper }
});
</script>
