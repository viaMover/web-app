<template>
  <section-base
    container-class="more__wrapper__menu-item"
    has-expand-button
    :heading-text="$t('nibbleShop.lblNibbleShop')"
    :name="$t('nibbleShop.lblNibbleShop')"
    navigate-to-name="nibble-shop-view-all"
  >
    <div class="item__list">
      <nibble-shop-product-mini
        v-for="product in nftList"
        :key="product.name"
        class="button-active"
        :item="product"
      />
    </div>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';

import SectionBase from './section-base/section-base.vue';
import {
  NibbleShopProductMini,
  NibbleShopProductMiniData
} from '@/components/nibble-shop';

export default Vue.extend({
  name: 'NibbleShopSection',
  components: {
    SectionBase,
    NibbleShopProductMini
  },
  data() {
    return {
      nftList: [
        {
          name: 'Cap',
          videoSrc: require('@/assets/videos/ceo_of_money.webm')
        },
        {
          name: 'Face mask',
          videoSrc: require('@/assets/videos/street_jungle.webm')
        },
        {
          name: 'Classic T-Shirt',
          videoSrc: require('@/assets/videos/instant_classic.webm')
        },
        {
          name: 'Power T-Shirt',
          videoSrc: require('@/assets/videos/power_t_shirt.webm')
        }
      ] as Array<NibbleShopProductMiniData>
    };
  }
});
</script>
