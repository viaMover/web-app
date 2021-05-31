<template>
  <div id="app">
    <wallet />
    <router-view />
  </div>
</template>

<script lang="ts">
import { mapActions } from 'vuex';
import Vue from 'vue';
import Wallet from '@/components/wallet/wallet.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Wallet
  },
  mounted() {
    this.setI18n(this.$i18n);
  },
  methods: {
    ...mapActions(['setI18n'])
  }
});
</script>
