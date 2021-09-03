<template>
  <section-base
    container-class="more__wrapper__menu-item"
    has-expand-button
    :heading-text="$t('NFTs.lblNFTDrops')"
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-view-all"
  >
    <div class="item__list">
      <nft-asset-card-mini v-for="nft in nftList" :key="nft.name" :item="nft" />
    </div>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import SectionBase from './section-base/section-base.vue';
import { NftAssetCardMini } from '@/components/nft';

export default Vue.extend({
  name: 'NftDropsSection',
  components: {
    SectionBase,
    NftAssetCardMini
  },
  computed: {
    ...mapState('nft', { nftList: 'nfts' })
  }
});
</script>
