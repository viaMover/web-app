<template>
  <ul class="item__list-item">
    <router-link class="button-active" :to="routeTo">
      <video
        :alt="$t('nibbleShop.txtProductAlt', { title: item.name })"
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        :src="item.videoSrc"
      />
      <h3>{{ item.name }}</h3>
    </router-link>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

import { NibbleShopProductMiniData } from './types';

export default Vue.extend({
  name: 'NibbleShopProductMini',
  props: {
    item: {
      type: Object as PropType<NibbleShopProductMiniData>,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.item.name }
      };
    }
  }
});
</script>
