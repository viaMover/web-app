<template>
  <content-wrapper
    class="nft-drops view view-all"
    has-back-button
    page-content-class="centered"
    @back="handleClose"
    @close="handleClose"
  >
    <custom-picture
      :alt="$t('NFTs.txtLogoAlt')"
      class="section-logo"
      :sources="headerImage.sources"
      :src="headerImage.src"
      :webp-sources="headerImage.webpSources"
    />

    <div class="product-tiles">
      <router-link
        v-for="nft in nftList"
        :key="nft.id"
        class="item button-like"
        :to="routeTo(nft.id)"
      >
        <custom-picture
          :alt="$t('NFTs.txtAssetAlt', { name: nft.name })"
          :sources="nft.bigPicture.sources"
          :src="nft.bigPicture.src"
          :webp-sources="nft.bigPicture.webpSources"
        />
        <h3 class="title">{{ nft.name }}</h3>
        <div class="description">
          {{ nftDescription(nft) }}
        </div>
      </router-link>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapGetters } from 'vuex';

import { BaseNftAsset } from '@/store/modules/nft/types';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'NftViewAll',
  components: {
    ContentWrapper,
    CustomPicture
  },
  data() {
    return {
      headerImage: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/NFT-Drops.png',
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/NFT-Drops.png'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/NFT-Drops@2x.png'
          }
        ],
        webpSources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/NFT-Drops.webp'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/NFT-Drops@2x.webp'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('nft', { nftList: 'nfts' })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    routeTo(id: string): RawLocation {
      return {
        name: id
      };
    },
    nftDescription(nft: BaseNftAsset): string | undefined {
      if (this.$te(`NFTs.txtNFTs.${nft.id}.description`)) {
        return this.$t(`NFTs.txtNFTs.${nft.id}.description`) as string;
      }

      const nftWithMeta = nft as BaseNftAsset & {
        meta?: { description?: string };
      };
      if (nftWithMeta.meta?.description !== undefined) {
        return nftWithMeta.meta.description;
      }

      return undefined;
    }
  }
});
</script>
