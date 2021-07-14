<template>
  <left-rail-section :section-name="$t('treasury.lblReservedAssets')">
    <left-rail-section-item
      v-for="asset in assets"
      :key="asset.name"
      :description="asset.name"
    >
      {{ asset.amount }}
      <template v-if="asset.displaySymbol"> &nbsp;{{ asset.symbol }} </template>
    </left-rail-section-item>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'TreasuryReservedAssets',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  data() {
    return {
      assets: [
        {
          name: 'MOVE',
          symbol: 'MOVE',
          displaySymbol: true,
          amount: 8485.1249
        },
        {
          name: 'MOVE-ETH LP',
          symbol: 'SLP',
          displaySymbol: true,
          amount: 6.6295
        },
        {
          name: 'The Powercard',
          symbol: 'RARIBLE 1155',
          displaySymbol: false,
          amount: 1
        }
      ]
    };
  }
});
</script>
