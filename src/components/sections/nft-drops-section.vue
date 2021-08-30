<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('NFTs.lblNFTDrops')"
    navigate-to-name="nft-view-all"
  >
    <template v-slot:heading>
      {{ $t('NFTs.lblNFTDrops') }}
    </template>

    <template v-slot:bottom>
      <div class="drops__items">
        <nft-asset-card-mini
          v-for="nft in list"
          :id="nft.id"
          :key="nft.id"
          class="button-active"
        ></nft-asset-card-mini>
      </div>
    </template>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import HeadingSection from './heading-section.vue';
import { NftAssetCardMini } from '@/components/nft';

export default Vue.extend({
  name: 'NftDropsSection',
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
