<template>
  <div class="overview treasury-overview">
    <h4>{{ $t('treasury.lblReservedAssets') }}</h4>
    <div class="info info-bordered">
      <div v-for="asset in assets" :key="asset.name" class="item">
        <span class="title">{{ asset.name }}</span>
        <span class="value">
          {{ asset.amount }}
          <template v-if="asset.displaySymbol">
            &nbsp;{{ asset.symbol }}
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TreasuryReservedAssets',
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
