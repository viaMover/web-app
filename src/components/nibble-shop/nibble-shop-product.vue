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
      <p class="price">{{ price }}</p>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { RawLocation } from 'vue-router';

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
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.id }
      };
    }
  }
});
</script>
