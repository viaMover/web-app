<template>
  <content-wrapper
    base-class="nft-drops"
    has-back-button
    page-container-class="nft-drops"
    @back="handleClose"
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
            :alt="nft.bigPicture.alt"
            :sources="nft.bigPicture.sources"
            :src="nft.bigPicture.src"
            :webp-sources="nft.bigPicture.webpSources"
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
import { mapState } from 'vuex';

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
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('nft', { nftList: 'nfts' })
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
