<template>
  <router-link v-if="product" class="card shop" :to="routeTo">
    <img
      :alt="$t('nibbleShop.txtProductAlt', { title: product.title })"
      class="image"
      :src="product.imageSrc"
    />
    <div class="text-container">
      <div class="title">{{ product.title }}</div>
      <div class="price">{{ product.price }}</div>
    </div>
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
    ...mapState('shop', ['assets']),
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.id }
      };
    },
    product(): Asset | null {
      return (
        (this.assets as Array<Asset>).find(
          (asset: Asset) => asset.id === this.id
        ) || null
      );
    }
  }
});
</script>
