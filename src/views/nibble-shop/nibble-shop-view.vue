<template>
  <content-wrapper
    has-back-button
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nibble-shop-product-overview :id="id" />
    </template>

    <secondary-page has-heading-buttons :title="id">
      <template v-slot:heading-buttons>
        <router-link :to="{ name: 'nibble-shop-buy', params: { id } }">
          {{ $t('nibbleShop.btnBuy.emoji') }}
        </router-link>
        <router-link :to="{ name: 'nibble-shop-sell', params: { id } }">
          {{ $t('nibbleShop.btnSell.emoji') }}
        </router-link>
        <router-link :to="{ name: 'nibble-shop-redeem', params: { id } }">
          {{ $t('nibbleShop.btnRedeem.emoji') }}
        </router-link>
      </template>
      <h2>{{ product.title }}</h2>
      <img
        :alt="$t('nibbleShop.txtProductAlt', { title: product.title })"
        class="image"
        :src="product.imageSrc"
      />
      <div class="price">{{ product.price }}</div>
      <div class="description">{{ product.description }}</div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper, SecondaryPage } from '@/components/layout';
import { NibbleShopProductOverview } from '@/components/nibble-shop';
import { mapState } from 'vuex';
import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopView',
  components: {
    ContentWrapper,
    NibbleShopProductOverview,
    SecondaryPage
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    product(): Asset | null {
      return (
        (this.products as Array<Asset>).find(
          (asset: Asset) => asset.id === this.id
        ) || null
      );
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
