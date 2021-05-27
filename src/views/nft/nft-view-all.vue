<template>
  <content-wrapper has-close-button @close="handleClose">
    <div class="image">
      <img :alt="$t('NFTs.txtLogoAlt')" src="/src/assets/nft.png" />
    </div>
    <div class="list nft-list">
      <nft-asset-card v-for="nft in assets" :id="nft.id" :key="nft.id" />
    </div>
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
