<template>
  <div v-if="isDetecting" class="preload">
    <div class="preload-wrapper">
      <div class="preload-wrapper__sidebar">
        <a class="logo" href="#">
          <img alt="logo" src="@/assets/images/logo.svg" />
        </a>
        <div class="sidebar-wrapper">
          <div class="preload-wrapper__sidebar-wrapper">
            <div class="preload-wrapper__sidebar-wrapper-user">
              <div class="user-icon"></div>
              <div class="user-button"></div>
              <div class="user-status"></div>
            </div>
            <div class="preload-wrapper__sidebar-wrapper-items">
              <div class="items-item">
                <div class="items-item__title"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
              </div>
              <div class="items-item">
                <div class="items-item__title"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="preload-wrapper__menu">
        <div class="g-wrapper">
          <div class="preload-wrapper__menu-wrapper">
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-top">
                <div class="title"></div>
                <div class="description"></div>
              </div>
            </div>
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-center">
                <div class="item">
                  <div class="item__title"></div>
                  <div class="item__description"></div>
                </div>
                <div class="item">
                  <div class="item__title"></div>
                  <div class="item__description"></div>
                </div>
              </div>
            </div>
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-bottom">
                <div class="title"></div>
                <div class="description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <main v-else>
    <a class="logo" href="#">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </a>
    <div class="general-no-wallet-desktop">
      <div class="g-wrapper">
        <div class="general-no-wallet-desktop__wrapper">
          <div class="general-no-wallet-desktop__wrapper-gif">
            <video
              autoplay="autoplay"
              data-keepplaying="data-keepplaying"
              loop="loop"
              muted="muted"
              src="@/assets/videos/welcome.webm"
            ></video>
          </div>
          <h1>{{ $t('lblConnectWallet') }}</h1>
          <p>
            {{ $t('txtConnectWallet') }}
          </p>
          <a class="black-link" href="#" @click.prevent="connectMetaMask">
            {{ metaMaskBtnText }}
          </a>
          <a class="black-link" href="#" @click.prevent="connectWalletConnect">
            WalletConnect
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import '@/styles/_general.less';

import Vue from 'vue';
import { mapGetters, mapState, mapActions } from 'vuex';

import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { InitWalletPayload } from '@/store/modules/account/actions/wallet';
import { InitCallbacks } from '@/web3/callbacks';

export default Vue.extend({
  name: 'ImportWallet',
  computed: {
    ...mapState('account', ['isDetecting', 'detectedProvider']),
    ...mapGetters('account', ['isWalletConnected']),
    metaMaskBtnText(): string {
      return this.detectedProvider ? 'Connect MetaMask' : 'Install MetaMask';
    }
  },
  watch: {
    isWalletConnected(newValue): void {
      if (newValue) {
        this.replaceRoute();
      }
    }
  },
  beforeMount() {
    if (this.isWalletConnected) {
      this.replaceRoute();
    }
  },
  methods: {
    ...mapActions('account', {
      initWallet: 'initWallet'
    }),
    replaceRoute(): void {
      this.$router.replace(this.$route.redirectedFrom ?? { name: 'home' });
    },
    async connectWalletConnect(): Promise<void> {
      //  Create WalletConnect Provider
      const provider = new WalletConnectProvider({
        infuraId: 'eac548bd478143d09d2c090d09251bf1'
      });
      await provider.enable();
      const providerWithCb = await InitCallbacks(provider);

      //  Enable session (triggers QR Code modal)
      this.initWallet({
        provider: providerWithCb.provider,
        providerName: 'WalletConnect',
        providerBeforeCloseCb: providerWithCb.onDisconnectCb,
        injected: false
      } as InitWalletPayload);
    },
    async connectMetaMask(): Promise<void> {
      if (this.detectedProvider) {
        const providerWithCb = await InitCallbacks(this.detectedProvider);
        this.initWallet({
          provider: providerWithCb.provider,
          providerName: 'MetaMask',
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: true
        } as InitWalletPayload);
      } else {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      }
    }
  }
});
</script>
