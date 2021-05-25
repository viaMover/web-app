<template>
  <router-view></router-view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NibbleShopRoot',
  computed: {
    hasNFT(): boolean {
      return true;
    }
  },
  beforeMount() {
    if (this.hasNFT) {
      return;
    }

    this.$router.replace({ name: 'nibble-shop-no-nft' });
  }
});
</script>
