<template>
  <router-link class="card shop" :to="routeTo">
    <img :alt="title" class="image" :src="imageSrc" />
    <div class="text-container">
      <div class="title">{{ title }}</div>
      <div class="price">{{ price }}</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';

export default Vue.extend({
  name: 'ShopAssetCard',
  props: {
    address: {
      type: String,
      required: true
    },
    imageSrc: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    }
  },
  computed: {
    routeTo(): RawLocation {
      return {
        name: 'shop-asset-exact-page',
        params: { address: this.address }
      };
    }
  }
});
</script>
