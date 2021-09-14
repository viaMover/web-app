<template>
  <content-wrapper
    base-class="nibble-shop"
    has-back-button
    page-container-class="nibble-shop"
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
      <nibble-shop-product
        v-for="product in products"
        :id="product.id"
        :key="product.id"
        :name="product.title"
        :price="product.price"
        :src="product.preview.videoSrc"
      />
    </ul>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import { NibbleShopProduct } from '@/components/nibble-shop';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'NibbleShopViewAll',
  components: {
    ContentWrapper,
    NibbleShopProduct,
    CustomPicture
  },
  data() {
    return {
      headerImage: {
        alt: this.$t('nibbleShop.txtLogoAlt'),
        src: require('@/assets/images/Nibble-Shop.png'),
        sources: [
          { src: require('@/assets/images/Nibble-Shop.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Nibble-Shop@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Nibble-Shop.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Nibble-Shop@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
