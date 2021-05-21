<template>
  <heading-section
    class="section nft"
    has-expand-button
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-drops"
  >
    <template v-slot:heading>
      {{ $t('NFTs.lblNFTDrops') }}
    </template>

    <div class="nfts-row">
      <nft-asset-card
        v-for="nft in list"
        :id="nft.id"
        :key="nft.id"
        :image-src="nft.imageSrc"
        :name="nft.name"
      ></nft-asset-card>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import HeadingSection from './heading-section.vue';
import NftAssetCard from '@/components/cards/nft-asset-card.vue';

export default Vue.extend({
  name: 'NftsSection',
  components: {
    HeadingSection,
    NftAssetCard
  },
  computed: {
    ...mapGetters('nft', { list: 'plainNFTs' })
  },
  async mounted() {
    await this.loadNFTInfoList();
  },
  methods: {
    ...mapActions('nft', ['loadNFTInfoList'])
  }
});
</script>
