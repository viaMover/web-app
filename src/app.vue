<template>
  <main id="app">
    <div class="dashboard">
      <transition-group appear name="fade">
        <preload v-show="showPreload" key="preload" />
        <router-view v-cloak v-if="!showPreload" key="viewport" />
      </transition-group>
    </div>
    <div class="dashboard-mobile">
      <a
        class="logo button-active"
        href="https://viamover.com/"
        target="_blank"
      >
        <img alt="logo" src="@/assets/images/logo.svg" />
      </a>
      <div class="g-wrapper">
        <div class="dashboard-mobile__wrapper">
          <div class="dashboard-mobile__wrapper-gif">
            <video
              autoplay="autoplay"
              data-keepplaying="data-keepplaying"
              loop="loop"
              muted="muted"
              playsinline="playsinline"
              src="@/assets/videos/welcome.webm"
            ></video>
          </div>
          <h1>Oh no!</h1>
          <p>
            Mover web app is for the big screens. We’ve got mobile apps for all
            the smaller screens.
          </p>
          <a class="black-link button-active" href="https://viamover.com/">
            Got it. Take me home
          </a>
        </div>
      </div>
    </div>
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
import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

export default Vue.extend({
  name: 'App',
  components: {
    Preload
  },
  computed: {
    ...mapGetters('account', {
      isWalletReady: 'isWalletReady',
      entireBalanceNative: 'entireBalance'
    }),
    showPreload(): boolean {
      return !this.isWalletReady && !this.$route.meta.skipPreloadScreen;
    },
    pageTitle(): string {
      const entireBalance = this.entireBalanceNative;
      if (entireBalance !== undefined && greaterThan(entireBalance, 0)) {
        return `$${formatToNative(entireBalance)} • ${this.$t(
          'lblPageTitleSuffix'
        )}`;
      } else {
        return this.$t('lblPageTitleDefault') as string;
      }
    }
  },
  watch: {
    pageTitle(newVal: string, oldVal: string): void {
      if (newVal === oldVal) {
        return;
      }

      this.setPageTitle(newVal);
    }
  },
  mounted() {
    this.setI18n(this.$i18n);
    this.setPageTitle(this.pageTitle);
  },
  methods: {
    ...mapActions(['setI18n']),
    setPageTitle(title: string): void {
      document.title = title;
    }
  }
});
</script>
