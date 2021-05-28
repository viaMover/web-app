<template>
  <router-view></router-view>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'NibbleShopRoot',
  computed: {
    hasNFT(): boolean {
      return true;
    }
  },
  async beforeMount() {
    if (this.hasNFT) {
      await this.loadAssetsInfoList();
      return;
    }

    this.$router.replace({ name: 'nibble-shop-no-nft' });
  },
  methods: {
    ...mapActions('shop', ['loadAssetsInfoList'])
  }
});
</script>
