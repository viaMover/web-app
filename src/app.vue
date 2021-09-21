<template>
  <main id="app">
    <web3-modal-vue
      ref="web3modal"
      cache-provider
      :provider-options="providerOptions"
      :theme="theme"
    />
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
import { mapActions, mapGetters, mapMutations } from 'vuex';
import Web3ModalVue from 'web3modal-vue';
import MewConnect from '@myetherwallet/mewconnect-web-client';
import Portis from '@portis/web3';

import '@/styles/_common.less';
import '@/styles/_modal.less';
import '@/styles/_execute_modal.less';
import '@/styles/_search_modal.less';
import Preload from '@/views/preload.vue';
import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { APIKeys } from './settings';
import { InitCallbacks } from './web3/callbacks';
import { InitWalletPayload } from './store/modules/account/actions/wallet';

export default Vue.extend({
  name: 'App',
  components: {
    Preload,
    Web3ModalVue
  },
  data() {
    return {
      theme: 'light',
      providerOptions: {
        mewconnect: {
          package: MewConnect,
          options: {
            infuraId: APIKeys.INFURA_PROJECT_ID
          }
        },
        portis: {
          package: Portis,
          options: {
            id: APIKeys.PORTUS_DAPP_ID
          }
        }
      }
    };
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
    this.setIsDetecting(true);
    this.$nextTick(async () => {
      const web3modal = this.$refs.web3modal as any;
      this.setWeb3Modal(web3modal);
      if (web3modal.cachedProvider) {
        const provider = await web3modal.connect();
        const providerWithCb = await InitCallbacks(provider);
        await this.initWallet({
          provider: providerWithCb.provider,
          providerName: 'WalletConnect',
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: false
        } as InitWalletPayload);
      }
      this.setIsDetecting(false);
    });
  },
  methods: {
    ...mapActions(['setI18n']),
    ...mapMutations('account', ['setWeb3Modal', 'setIsDetecting']),
    ...mapActions('account', ['initWallet']),
    setPageTitle(title: string): void {
      document.title = title;
    }
  }
});
</script>
