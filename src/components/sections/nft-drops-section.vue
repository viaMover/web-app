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

import SectionBase from './section-base/section-base.vue';
import { NftAssetCardMini, NftAssetCardMiniData } from '@/components/nft';

export default Vue.extend({
  name: 'NftDropsSection',
  components: {
    SectionBase,
    NftAssetCardMini
  },
  data() {
    return {
      nftList: [
        {
          name: 'Swap Passport',
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Swap Passport' }),
            src: require('@/assets/images/SwapPassport.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassport@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SwapPassport.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassport@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Sweet & Sour',
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Sweet & Sour' }),
            src: require('@/assets/images/SweetAndSour.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSour@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SweetAndSour.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSour@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Unexpected Move',
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Unexpected Move' }),
            src: require('@/assets/images/UnexpectedMove.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMove@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/UnexpectedMove.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMove@2x.webp')
              }
            ]
          }
        }
      ] as Array<NftAssetCardMiniData>
    };
  }
});
</script>
