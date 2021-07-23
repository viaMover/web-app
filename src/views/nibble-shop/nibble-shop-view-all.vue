<template>
  <content-wrapper
    base-class="nibble-shop"
    has-close-button
    is-black-close-button
    page-container-class="nibble-shop__wrapper"
    wrapper-class="nibble-shop__wrapper"
    @close="handleClose"
  >
    <div class="nibble-shop__wrapper-info-title">
      <img
        :alt="$t('nibbleShop.txtLogoAlt')"
        src="@/assets/images/nibble-shop.png"
      />
    </div>
    <ul class="nibble-shop__wrapper-info-items">
      <nibble-shop-product
        v-for="product in products"
        :key="product.id"
        :item="product"
      />
    </ul>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import { NibbleShopProduct } from '@/components/nibble-shop';

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
