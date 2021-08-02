<template>
  <content-wrapper
    base-class="nft-drops"
    has-close-button
    is-black-close-button
    wrapper-class="nft-drops__wrapper"
    @close="handleClose"
  >
    <div class="nft-drops__wrapper__menu-info-title">
      <img :alt="$t('NFTs.txtLogoAlt')" src="@/assets/images/NFT-Drops.png" />
    </div>
    <ul class="nft-drops__wrapper__menu-info-items">
      <nft-asset-card v-for="nft in assets" :key="nft.id" :item="nft" />
    </ul>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import { NftAssetCard } from '@/components/nft';

export default Vue.extend({
  name: 'NftViewAll',
  components: {
    ContentWrapper,
    NftAssetCard
  },
  computed: {
    ...mapGetters('nft', { assets: 'plainNFTs' })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
