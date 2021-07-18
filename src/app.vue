<template>
  <main id="app">
    <wallet />
    <preload v-show="showPreload" />
    <router-view v-cloak v-show="!showPreload" />
  </main>
</template>

<script lang="ts">
import '@/styles/_common.less';
import '@/styles/_modal.less';
import '@/styles/_swap_modal.less';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import Wallet from '@/components/wallet/wallet.vue';
import Preload from '@/views/preload.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Preload,
    Wallet
  },
  computed: {
    ...mapGetters('account', ['isWalletReady']),
    showPreload(): boolean {
      return !this.isWalletReady && !this.$route.meta.skipPreloadScreen;
    }
  },
  mounted() {
    this.setI18n(this.$i18n);
  },
  methods: {
    ...mapActions(['setI18n'])
  }
});
</script>
