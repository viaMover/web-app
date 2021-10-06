<template>
  <section-base
    container-class="more__wrapper__menu-item"
    has-expand-button
    :heading-text="$t('NFTs.lblNFTDrops')"
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-view-all"
  >
    <swiper
      allow-touch-move
      class="item__list"
      grab-cursor
      mousewheel
      :slides-per-view="4.3"
      :space-between="0"
      use-navigation-buttons
    >
      <nft-asset-card-mini
        v-for="nft in nftList"
        :key="nft.name"
        class="swiper-slide"
        :item="nft"
      />
    </swiper>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { NftAssetCardMini } from '@/components/nft';
import Swiper from '@/components/swiper/swiper.vue';

import SectionBase from './section-base/section-base.vue';

export default Vue.extend({
  name: 'NftDropsSection',
  components: {
    Swiper,
    SectionBase,
    NftAssetCardMini
  },
  computed: {
    ...mapState('nft', { nftList: 'nfts' })
  }
});
</script>
