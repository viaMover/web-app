<template>
  <li class="nft-drops__wrapper-info-items-item">
    <img
      :alt="$t('NFTs.txtAssetAlt', { name: asset.nft.name })"
      :src="asset.nft.imageSrc"
    />
    <div class="nft-drops__wrapper-info-items-item-content">
      <h3>{{ asset.nft.name }}</h3>
      <p>
        {{ asset.nft.description }}
      </p>
    </div>
    <router-link class="button-active" :class="[buttonClass]" :to="routeTo">
      {{ $t('NFTs.btnGet.simple') }}
    </router-link>
  </li>
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
