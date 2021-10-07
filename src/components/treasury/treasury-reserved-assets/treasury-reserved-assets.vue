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
import { mapGetters, mapState } from 'vuex';

import { formatToDecimals } from '@/utils/format';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';
import { ReservedAsset } from '@/components/treasury/treasury-reserved-assets/types';

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
    ...mapGetters('account', {
      treasuryStakedMove: 'treasuryStakedMove',
      treasuryStakedMoveLP: 'treasuryStakedMoveLP'
    }),
    formattedMoveAmount(): string {
      const moveAmountNative = this.treasuryStakedMove;
      return formatToDecimals(moveAmountNative, 4);
    },
    formattedMoveEthLPAmount(): string {
      const moveEthLPAmountNative = this.treasuryStakedMoveLP;
      return formatToDecimals(moveEthLPAmountNative, 4);
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
          amount: this.formattedMoveAmount
        },
        {
          name: 'MOVE-ETH LP',
          symbol: moveEthLPAsset.symbol,
          displaySymbol: true,
          amount: this.formattedMoveEthLPAmount
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
