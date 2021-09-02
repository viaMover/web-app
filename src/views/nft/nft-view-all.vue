<template>
  <content-wrapper
    base-class="nft-drops"
    has-back-button
    page-container-class="nft-drops"
    @close="handleClose"
  >
    <custom-picture
      :alt="headerImage.alt"
      class="image"
      :sources="headerImage.sources"
      :src="headerImage.src"
      :webp-sources="headerImage.webpSources"
    />
    <ul class="list">
      <li v-for="nft in nftList" :key="nft.name" class="list__item">
        <router-link class="button-active" :to="routeTo(nft.name)">
          <custom-picture
            :alt="nft.picture.alt"
            :sources="nft.picture.sources"
            :src="nft.picture.src"
            :webp-sources="nft.picture.webpSources"
          />
          <h3>{{ nft.name }}</h3>
          <p class="description">{{ nft.description }}</p>
        </router-link>
      </li>
    </ul>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';

import { NftAssetViewAllCardData } from '@/components/nft';
import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'NftViewAll',
  components: {
    ContentWrapper,
    CustomPicture
  },
  data() {
    const result = {
      headerImage: {
        alt: this.$t('NFTs.txtLogoAlt'),
        src: require('@/assets/images/NFT-Drops.png'),
        sources: [
          { src: require('@/assets/images/NFT-Drops.png') },
          {
            variant: '2x',
            src: require('@/assets/images/NFT-Drops@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/NFT-Drops.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/NFT-Drops@2x.webp')
          }
        ]
      } as PictureDescriptor,
      nftList: [
        {
          name: 'Moving With Olympus',
          description: this.$t('NFTs.txtNFTs.movingWithOlympus.description'),
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Mowing With Olympus' }),
            src: require('@/assets/images/MovingWithOlympusBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympusBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/MovingWithOlympusBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympusBig@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Sweet & Sour',
          description: this.$t('NFTs.txtNFTs.sweetAndSour.description'),
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Sweet & Sour' }),
            src: require('@/assets/images/SweetAndSourBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSourBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SweetAndSourBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSourBig@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Unexpected Move',
          description: this.$t('NFTs.txtNFTs.unexpectedMove.description'),
          picture: {
            alt: this.$t('NFTs.txtAssetAlt', { name: 'Unexpected Move' }),
            src: require('@/assets/images/UnexpectedMoveBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMoveBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/UnexpectedMoveBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMoveBig@2x.webp')
              }
            ]
          }
        }
      ] as Array<NftAssetViewAllCardData>
    };

    if (isFeatureEnabled('isSwapPassportEnabled')) {
      result.nftList.push({
        name: 'Swap Passport',
        description: this.$t('NFTs.txtNFTs.swapPassport.description'),
        picture: {
          alt: this.$t('NFTs.txtAssetAlt', { name: 'Swap Passport' }),
          src: require('@/assets/images/SwapPassportBig.png'),
          sources: [
            {
              variant: '2x',
              src: require('@/assets/images/SwapPassportBig@2x.png')
            }
          ],
          webpSources: [
            { src: require('@/assets/images/SwapPassportBig.webp') },
            {
              variant: '2x',
              src: require('@/assets/images/SwapPassportBig@2x.webp')
            }
          ]
        }
      } as NftAssetViewAllCardData);
    }

    return result;
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    routeTo(name: string): RawLocation {
      return {
        name: name.toLowerCase().replaceAll(' ', '-')
      };
    }
  }
});
</script>
