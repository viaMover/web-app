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
        v-for="product in products"
        :id="product.id"
        :key="product.title"
        class="button-active"
        :name="product.title"
        :src="product.preview.videoSrc"
      />
    </div>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { NibbleShopProductMini } from '@/components/nibble-shop';

import SectionBase from './section-base/section-base.vue';

export default Vue.extend({
  name: 'NibbleShopSection',
  components: {
    SectionBase,
    NibbleShopProductMini
  },
  computed: {
    ...mapState('shop', { products: 'assets' })
  }
});
</script>
