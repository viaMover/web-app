<template>
  <base-section
    class="nft-drops"
    :heading-text="$t('nftDrops')"
    name="nft drops"
    navigate-to-name="nft-view-all"
  >
    <div class="products" :class="{ 'no-content': displayedNfts.length < 1 }">
      <nft-asset-card-mini
        v-for="nft in displayedNfts"
        :key="nft.id"
        class="shadow"
        hide-title
        :item="nft"
      />
      <div
        v-for="idx in itemsCount"
        :key="idx"
        class="item placeholder shadow"
      />
    </div>
  </base-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { BaseNftAsset } from '@/store/modules/nft/types';

import NftAssetCardMini from '@/components/v1.2/nft/nft-asset-card-mini.vue';

import BaseSection from './base-section.vue';

export default Vue.extend({
  components: { BaseSection, NftAssetCardMini },
  data() {
    return {
      itemsCount: 5
    };
  },
  computed: {
    ...mapGetters('nft', { nftList: 'nfts' }),
    displayedNfts(): Array<BaseNftAsset> {
      return this.nftList.slice(0, this.itemsCount);
    }
  }
});
</script>
