<template>
  <main id="app">
    <transition-group appear name="fade">
      <preload v-show="showPreload" key="preload" />
      <router-view v-cloak v-if="!showPreload" key="viewport" />
    </transition-group>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import Preload from '@/views/preload.vue';

import '@/styles/_common.less';
import '@/styles/_modal.less';
import '@/styles/_execute_modal.less';
import '@/styles/_search_modal.less';

export default Vue.extend({
  name: 'App',
  components: {
    Preload
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
