<template>
  <content-wrapper
    class="nibble-shop view view-all"
    has-back-button
    page-content-class="centered"
    @back="handleClose"
    @close="handleClose"
  >
    <custom-picture
      :alt="headerImage.alt"
      class="section-logo"
      :sources="headerImage.sources"
      :src="headerImage.src"
      :webp-sources="headerImage.webpSources"
    />

    <div class="product-tiles">
      <nibble-shop-product
        v-for="product in products"
        :id="product.id"
        :key="product.id"
        :name="product.title"
        :price="product.feeAmount"
        :src="product.preview.videoSrc"
      />
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import { NibbleShopProduct } from '@/components/nibble-shop';

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
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/Nibble-Shop.png',
        sources: [
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/Nibble-Shop@2x.png'
          }
        ],
        webpSources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/Nibble-Shop.webp'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/Nibble-Shop@2x.webp'
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
