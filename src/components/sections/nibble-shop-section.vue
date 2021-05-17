<template>
  <heading-section
    class="section nibble"
    has-expand-button
    :name="$t('lblNibbleShop')"
    navigate-to-name="nibble-shop"
  >
    <template v-slot:heading>
      {{ $t('lblNibbleShop') }}
    </template>

    <div class="assets-row">
      <shop-asset-card
        v-for="asset in assets"
        :key="asset.address"
        :address="asset.address"
        :image-src="asset.imageSrc"
        :price="asset.price"
        :title="asset.title"
      ></shop-asset-card>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import HeadingSection from './heading-section.vue';
import ShopAssetCard from '@/components/cards/shop-asset-card.vue';

export default Vue.extend({
  name: 'NibbleShopSection',
  components: {
    HeadingSection,
    ShopAssetCard
  },
  computed: {
    ...mapState('shop', ['assets'])
  }
});
</script>
