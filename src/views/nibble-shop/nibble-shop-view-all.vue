<template>
  <content-wrapper has-close-button @close="handleClose">
    <div class="image">
      <img
        :alt="$t('nibbleShop.txtLogoAlt')"
        src="/src/assets/nibble-shop.png"
      />
    </div>
    <div class="list product-list">
      <nibble-shop-product
        v-for="product in products"
        :id="product.id"
        :key="product.id"
      />
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import { NibbleShopProduct } from '@/components/nibble-shop';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'NibbleShopViewAll',
  components: {
    ContentWrapper,
    NibbleShopProduct
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
