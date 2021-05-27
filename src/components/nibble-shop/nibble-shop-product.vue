<template>
  <div v-if="product" class="card product-card">
    <img
      :alt="$t('nibbleShop.txtProductAlt', { title: product.title })"
      class="image"
      :src="product.imageSrc"
    />
    <div class="content">
      <div class="heading">
        <h5>{{ product.title }}</h5>
        <span>{{ product.edition }}</span>
      </div>
      <div class="price-container">{{ product.price }}</div>
      <div class="button-container">
        <router-link class="button button-primary" :to="routeTo">
          {{ $t('nibbleShop.btnGet.simple') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RawLocation } from 'vue-router';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProduct',
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
