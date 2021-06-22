<template>
  <main id="app">
    <wallet />
    <preload v-show="isDetecting" />
    <router-view v-cloak v-show="!isDetecting" />
  </main>
</template>

<script lang="ts">
import '@/styles/_common.less';

import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import Wallet from '@/components/wallet/wallet.vue';
import Preload from '@/views/preload.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Preload,
    Wallet
  },
  computed: {
    ...mapState('account', ['isDetecting'])
  },
  mounted() {
    this.setI18n(this.$i18n);
  },
  methods: {
    ...mapActions(['setI18n'])
  }
});
</script>
