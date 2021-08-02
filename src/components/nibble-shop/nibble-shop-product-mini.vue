<template>
  <router-link v-if="item" class="shop__items-item" :to="routeTo">
    <div class="shop__items-item-image">
      <img
        :alt="$t('nibbleShop.txtProductAlt', { title: item.title })"
        :src="item.previewImageSrc"
      />
    </div>
    <p>{{ item.title }}</p>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProductMini',
  props: {
    item: {
      type: Object as PropType<Asset>,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.item.id }
      };
    }
  }
});
</script>
