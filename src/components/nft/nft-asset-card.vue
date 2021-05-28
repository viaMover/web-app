<template>
  <div class="card card-nft">
    <img
      :alt="$t('NFTs.txtAssetAlt', { name: asset.nft.name })"
      class="image"
      :src="asset.nft.imageSrc"
    />
    <div class="container container-text">
      <h5>{{ asset.nft.name }}</h5>
      <div class="description">
        {{ asset.nft.description }}
      </div>
    </div>
    <router-link class="button" :class="[buttonClass]" :to="routeTo">
      {{ $t('NFTs.btnGet.simple') }}
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RawLocation } from 'vue-router';

import { NFTAggregatedInfo } from '@/store/modules/nft/types';

export default Vue.extend({
  name: 'NftAssetCard',
  props: {
    id: {
      type: String,
      required: true
    },
    buttonClass: {
      type: String,
      default: 'button-primary'
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
