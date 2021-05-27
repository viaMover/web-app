<template>
  <heading-section
    class="section nft"
    has-expand-button
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-view-all"
  >
    <template v-slot:heading>
      {{ $t('NFTs.lblNFTDrops') }}
    </template>

    <div class="nfts-row">
      <nft-asset-card-mini
        v-for="nft in list"
        :id="nft.id"
        :key="nft.id"
      ></nft-asset-card-mini>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import HeadingSection from './heading-section.vue';
import { NftAssetCardMini } from '@/components/nft/';

export default Vue.extend({
  name: 'NftsSection',
  components: {
    HeadingSection,
    NftAssetCardMini
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
