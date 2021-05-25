<template>
  <div v-if="product" class="overview treasury-overview">
    <h4>{{ $t('nibbleShop.lblAssetOverview', { name: product.title }) }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblTotalTrades') }}</span>
        <span class="value">{{ product.totalTrades }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblQuantity.initial') }}</span>
        <span class="value">{{ product.initialQuantity }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblQuantity.redeemed') }}</span>
        <span class="value">{{ product.redeemedQuantity }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblQuantity.remaining') }}</span>
        <span class="value">{{ product.remainingQuantity }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblQuantity.available') }}</span>
        <span class="value">{{ product.availableQuantity }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('nibbleShop.lblCurrentPrice') }}</span>
        <span class="value">{{ product.price }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProductOverview',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
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
