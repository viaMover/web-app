<template>
  <release-radar-page-section title="Token of the day">
    <div class="token">
      <div class="token__info">
        <div class="token__info-description">
          <h2>RUNE</h2>
          <p>
            RUNE is a native token of THORChain — a cross-network AMM exchange.
            THORChain allows for native swaps between various blockchains e.g. a
            native swap between ETH and BTC.
          </p>
        </div>
        <div class="token__info-coin getShadow">
          <img
            alt="coin"
            class="button-active"
            src="@/assets/images/rune-icon.png"
          />
        </div>
      </div>
      <router-link class="black-link button-active" :to="{ name: 'home' }">
        Get
      </router-link>
    </div>
  </release-radar-page-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { ReleaseRadarPageSection } from '@/components/release-radar/release-radar-page-section';

export default Vue.extend({
  name: 'ReleaseRadarTokenOfTheDay',
  components: {
    ReleaseRadarPageSection
  }
});
</script>
