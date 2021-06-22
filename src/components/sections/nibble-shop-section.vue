<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('nibbleShop.lblNibbleShop')"
    navigate-to-name="nibble-shop-view-all"
  >
    <template v-slot:heading>
      {{ $t('nibbleShop.lblNibbleShop') }}
    </template>

    <template v-slot:bottom>
      <div class="shop__items">
        <nibble-shop-product-mini
          v-for="product in products"
          :id="product.id"
          :key="product.id"
        ></nibble-shop-product-mini>
      </div>
    </template>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import HeadingSection from './heading-section.vue';
import { NibbleShopProductMini } from '@/components/nibble-shop';

export default Vue.extend({
  name: 'NibbleShopSection',
  components: {
    HeadingSection,
    NibbleShopProductMini
  },
  computed: {
    ...mapState('shop', { products: 'assets' })
  },
  async beforeMount() {
    await this.loadAssetsInfoList();
  },
  methods: {
    ...mapActions('shop', ['loadAssetsInfoList'])
  }
});
</script>
