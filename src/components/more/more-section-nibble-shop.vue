<template>
  <more-section-base
    has-expand-button
    :heading-text="$t('nibbleShop.lblNibbleShop')"
    :name="$t('nibbleShop.lblNibbleShop')"
    navigate-to-name="nibble-shop-view-all"
  >
    <swiper
      allow-touch-move
      class="product-carousel"
      grab-cursor
      mousewheel
      :slides-per-view="4.3"
      :space-between="0"
      use-navigation-buttons
    >
      <nibble-shop-product-mini
        v-for="product in products"
        :id="product.id"
        :key="product.title"
        :name="product.title"
        :src="product.preview.videoSrc"
      />
    </swiper>
  </more-section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { NibbleShopProductMini } from '@/components/nibble-shop';
import { Swiper } from '@/components/swiper';

import MoreSectionBase from './more-section-base.vue';

export default Vue.extend({
  name: 'MoreSectionNibbleShop',
  components: {
    MoreSectionBase,
    Swiper,
    NibbleShopProductMini
  },
  computed: {
    ...mapState('shop', { products: 'assets' })
  }
});
</script>
