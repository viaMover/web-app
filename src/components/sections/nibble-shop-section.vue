<template>
  <heading-section
    class="section nibble"
    has-expand-button
    :name="$t('nibbleShop.lblNibbleShop')"
    navigate-to-name="nibble-shop-view-all"
  >
    <template v-slot:heading>
      {{ $t('nibbleShop.lblNibbleShop') }}
    </template>

    <div class="assets-row">
      <nibble-shop-product-mini
        v-for="product in products"
        :id="product.id"
        :key="product.id"
      ></nibble-shop-product-mini>
    </div>
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
