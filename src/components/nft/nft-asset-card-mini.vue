<template>
  <router-link v-if="asset" class="card nft" :to="routeTo">
    <img :alt="asset.nft.imageSrc" class="image" :src="asset.nft.imageSrc" />
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RawLocation } from 'vue-router';

import { NFTAggregatedInfo } from '@/store/modules/nft/types';

export default Vue.extend({
  name: 'NftAssetCardMini',
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
    },
    routeTo(): RawLocation {
      return {
        name: 'nft-view',
        params: { id: this.id }
      };
    }
  }
});
</script>
