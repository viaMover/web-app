<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import '@/styles/_nft.less';

export default Vue.extend({
  name: 'NftRoot',
  async beforeMount() {
    await this.loadNFTInfo();
  },
  methods: {
    ...mapActions('nft', ['loadNFTInfo'])
  }
});
</script>
