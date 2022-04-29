<template>
  <base-section
    class="nibble-shop"
    :description-text="$t('moverShopDescription')"
    :heading-text="$t('moverShop')"
    name="nibble-shop"
  >
    <div
      class="products"
      :class="{ 'no-content': displayedProducts.length < 1 }"
    >
      <nibble-shop-product-mini
        v-for="product in displayedProducts"
        :id="product.id"
        :key="product.title"
        :name="product.title"
        :src="product.preview.videoSrc"
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
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

import { NibbleShopProductMini } from '@/components/nibble-shop';

import BaseSection from './base-section.vue';

export default Vue.extend({
  components: { BaseSection, NibbleShopProductMini },
  data() {
    return {
      itemsCount: 3
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    displayedProducts(): Array<Asset> {
      return this.products.slice(0, this.itemsCount);
    }
  }
});
</script>
