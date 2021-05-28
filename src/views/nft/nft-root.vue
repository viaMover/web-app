<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'NftRoot',
  async beforeMount() {
    await this.loadNFTInfoList();
  },
  methods: {
    ...mapActions('nft', ['loadNFTInfoList'])
  }
});
</script>
