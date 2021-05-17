<template>
  <router-link class="card nft" :to="routeTo">
    <img :alt="name" class="image" :src="imageSrc" />
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';

export default Vue.extend({
  name: 'NftAssetCard',
  props: {
    id: {
      type: String,
      required: true
    },
    imageSrc: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    routeTo(): RawLocation {
      return {
        name: 'nft-asset-exact-page',
        params: { id: this.id }
      };
    }
  }
});
</script>
