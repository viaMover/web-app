<template>
  <release-radar-page-section :title="$t('radar.lblTokenOfTheDay')">
    <div class="token">
      <div class="token__info">
        <div class="token__info-description">
          <h2>{{ $t('radar.lblRune') }}</h2>
          <p>
            {{ $t('radar.txtRadar.runeDescription') }}
          </p>
        </div>
        <div class="token__info-coin getShadow">
          <img
            :alt="$t('radar.txtRuneAlt', { name: 'Rune' })"
            class="button-active"
            src="https://storage.googleapis.com/mover-webapp-assets/images/rune-icon.png"
          />
        </div>
      </div>
      <router-link class="black-link button-active" :to="{ name: 'home' }">
        {{ $t('radar.btnGet.simple') }}
      </router-link>
    </div>
  </release-radar-page-section>
</template>

<script lang="ts">
import Vue from 'vue';

import ReleaseRadarPageSection from '@/components/release-radar/release-radar-page-section.vue';

export default Vue.extend({
  name: 'ReleaseRadarTokenOfTheDay',
  components: {
    ReleaseRadarPageSection
  }
});
</script>
