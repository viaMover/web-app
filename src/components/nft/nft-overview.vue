<template>
  <div v-if="asset" class="overview nft-overview">
    <h4>{{ $t('NFTs.lblNFTOverview', { name: asset.nft.name }) }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('NFTs.lblTotalNumberOfNFTs') }}</span>
        <span class="value">{{ asset.totalNumber }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('NFTs.lblTotalClaimed') }}</span>
        <span class="value">{{ asset.totalClaimed }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { NFTAggregatedInfo } from '@/store/modules/nft/types';

export default Vue.extend({
  name: 'NftOverview',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('nft', { assets: 'NFTs' }),
    asset(): NFTAggregatedInfo | null {
      return (
        (this.assets as Array<NFTAggregatedInfo>).find(
          (asset: NFTAggregatedInfo) => asset.nft.id === this.id
        ) || null
      );
    }
  }
});
</script>
