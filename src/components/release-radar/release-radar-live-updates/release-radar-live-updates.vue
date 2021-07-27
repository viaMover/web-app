<template>
  <release-radar-page-section>
    <template v-slot:title>
      <div class="release-radar-desktop__menu-wrapper-item-title">
        <h2>{{ $t('radar.liveUpdates.lblLiveUpdates') }}</h2>
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
        :title="$t('radar.liveUpdates.lblTopMovers')"
      />
      <release-radar-live-updates-item
        icon="💩"
        navigate-to-name="home"
        :title="$t('radar.liveUpdates.lblTopLosers')"
      />
      <release-radar-live-updates-item
        icon="🐵"
        navigate-to-name="home"
        :title="$t('radar.liveUpdates.lblNewTokens')"
      />
      <release-radar-live-updates-item
        icon="🎢"
        navigate-to-name="home"
        :title="$t('radar.liveUpdates.lblDeFi')"
      />
      <release-radar-live-updates-item
        icon="💵"
        navigate-to-name="home"
        :title="$t('radar.liveUpdates.lblStablecoins')"
      />
    </swiper>
  </release-radar-page-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { Swiper } from '@/components/swiper';
import ReleaseRadarPageSection from '@/components/release-radar/release-radar-page-section.vue';
import ReleaseRadarLiveUpdatesItem from './release-radar-live-updates-item.vue';

export default Vue.extend({
  name: 'ReleaseRadarLiveUpdates',
  components: { ReleaseRadarPageSection, ReleaseRadarLiveUpdatesItem, Swiper }
});
</script>
