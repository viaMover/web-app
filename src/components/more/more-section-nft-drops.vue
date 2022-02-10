<template>
  <more-section-base
    has-expand-button
    :heading-text="$t('NFTs.lblNFTDrops')"
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-view-all"
  >
    <swiper
      allow-touch-move
      class="product-carousel"
      grab-cursor
      mousewheel
      :slides-per-view="4.3"
      :space-between="0"
      use-navigation-buttons
    >
      <nft-asset-card-mini
        v-for="nft in nftList"
        :key="nft.id"
        class="swiper-slide item"
        :item="nft"
      />
    </swiper>
  </more-section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { NftAssetCardMini } from '@/components/nft';
import Swiper from '@/components/swiper/swiper.vue';

import MoreSectionBase from './more-section-base.vue';

export default Vue.extend({
  name: 'MoreSectionNftDrops',
  components: {
    Swiper,
    MoreSectionBase,
    NftAssetCardMini
  },
  computed: {
    ...mapGetters('nft', { nftList: 'nfts' })
  }
});
</script>
