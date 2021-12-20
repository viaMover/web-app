<template>
  <li class="list__item">
    <router-link class="button button-primary button-active" :to="routeTo">
      <video
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        :src="src"
      />
      <h3>{{ name }}</h3>
      <p class="price">{{ productPrice }}</p>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

import { fromWei } from '@/utils/bigmath';

export default Vue.extend({
  name: 'NibbleShopProduct',
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
    },
    price: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    productPrice(): string {
      return `Ξ${fromWei(this.price, 18)}`;
    },
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.id }
      };
    }
  }
});
</script>
