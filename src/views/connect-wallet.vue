<template>
  <content-wrapper
    page-container-class="general-no-wallet-desktop"
    wrapper-class="general-no-wallet-desktop"
  >
    <a class="logo" href="https://viamover.com">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </a>
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
        Mover is a non-custodial service. It means that you need to connect your
        wallet first, to continue.
        <br />
        By connecting your wallet, you agree with the
        <a href="https://viamover.com/terms_of_use" target="_blank">
          Terms and Conditions
        </a>
        .
      </p>
      <div class="buttons">
        <button
          class="buttons-item button-active"
          type="button"
          @click.prevent="connectMetaMask"
        >
          <img src="@/assets/images/metamask.svg" />
        </button>
        <button
          class="buttons-item button-active"
          type="button"
          @click.prevent="connectWalletConnect"
        >
          <img src="@/assets/images/wallet-connect.svg" />
        </button>
      </div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import '@/styles/_general.less';

import Vue from 'vue';
import { mapGetters, mapState, mapActions } from 'vuex';

import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { InitWalletPayload } from '@/store/modules/account/actions/wallet';
import { InitCallbacks } from '@/web3/callbacks';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'ConnectWallet',
  components: {
    ContentWrapper
  },
  computed: {
    ...mapState('account', ['detectedProvider', 'addresses']),
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
