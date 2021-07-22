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
import { ReservedAsset } from '@/components/treasury/treasury-reserved-assets/types';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import { mapState } from 'vuex';
import { BigNumber } from 'bignumber.js';

export default Vue.extend({
  name: 'TreasuryReservedAssets',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'treasuryTotalStakedMove',
      'treasuryTotalStakedMoveEthLP'
    ]),
    formattedMoveAmountNative(): string {
      const moveAmountNative = this.treasuryTotalStakedMove ?? '0';
      return new BigNumber(moveAmountNative).toFormat(4);
    },
    formattedMoveEthLPAmountNative(): string {
      const moveEthLPAmountNative = this.treasuryTotalStakedMoveEthLP ?? '0';
      return new BigNumber(moveEthLPAmountNative).toFormat(4);
    },
    assets(): Array<ReservedAsset> {
      if (this.networkInfo === undefined) {
        return [];
      }

      const network = this.networkInfo.network;

      const moveAsset = getMoveAssetData(network);
      const moveEthLPAsset = getMoveWethLPAssetData(network);

      return [
        {
          name: 'MOVE',
          symbol: moveAsset.symbol,
          displaySymbol: true,
          amount: this.formattedMoveAmountNative
        },
        {
          name: 'MOVE-ETH LP',
          symbol: moveEthLPAsset.symbol,
          displaySymbol: true,
          amount: this.formattedMoveEthLPAmountNative
        },
        {
          name: 'The Powercard',
          symbol: 'RARIBLE 1155',
          displaySymbol: false,
          amount: '0'
        }
      ];
    }
  }
});
</script>
