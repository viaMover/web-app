<template>
  <left-rail-section
    :section-name="$t('NFTs.lblNFTOverview', { name: item.nft.name })"
  >
    <left-rail-section-item
      :description="$t('NFTs.lblTotalNumberOfNFTs')"
      :value="item.totalNumber"
    />
    <left-rail-section-item
      :description="$t('NFTs.lblTotalClaimed')"
      :value="item.totalClaimed"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { NFTAggregatedInfo } from '@/store/modules/nft/types';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'NftOverview',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  props: {
    item: {
      type: Object as PropType<NFTAggregatedInfo>,
      required: true
    }
  }
});
</script>
