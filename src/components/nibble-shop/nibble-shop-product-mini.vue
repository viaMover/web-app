<template>
  <router-link v-if="product" class="shop__items-item" :to="routeTo">
    <div class="shop__items-item-image">
      <img
        :alt="$t('nibbleShop.txtProductAlt', { title: product.title })"
        :src="product.imageSrc"
      />
    </div>
    <p>{{ product.title }}</p>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProductMini',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.id }
      };
    },
    product(): Asset | null {
      return (
        (this.products as Array<Asset>).find(
          (asset: Asset) => asset.id === this.id
        ) || null
      );
    }
  }
});
</script>
