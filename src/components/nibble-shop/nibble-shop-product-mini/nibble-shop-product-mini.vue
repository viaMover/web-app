<template>
  <router-link class="button-like item" :to="routeTo">
    <video
      :alt="$t('nibbleShop.txtProductAlt', { name })"
      autoplay="autoplay"
      data-keepplaying="data-keepplaying"
      loop="loop"
      muted="muted"
      playsinline="playsinline"
      poster="@/assets/images/ios-spinner.svg"
      :src="src"
    />
    <h3 class="title">{{ name }}</h3>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'NibbleShopProductMini',
  props: {
    id: {
      type: String,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    name: {
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
    }
  }
});
</script>
