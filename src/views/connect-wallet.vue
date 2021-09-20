<template>
  <content-wrapper
    page-container-class="general-no-wallet-desktop"
    wrapper-class="general-no-wallet-desktop"
  >
    <a class="logo" href="https://viamover.com">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </a>
    <div class="general-no-wallet-desktop__wrapper">
      <div class="general-no-wallet-desktop__wrapper-info">
        <h1 class="title">{{ $t('lblConnectWallet') }}</h1>
        <p class="description">
          Mover is a non-custodial service. It means that you need to connect
          your your wallet first, to continue.
          <br />
          By connecting your wallet, you agree with the
          <a href="https://viamover.com/terms_of_use" target="_blank">
            Terms and Conditions
          </a>
          .
        </p>
        <button
          class="button-active black-link"
          type="button"
          @click.prevent="otherProvider"
        >
          Connect other wallet providers
        </button>
        <p class="text">Choose from Metamask and other popular wallets</p>
      </div>
      <div class="general-no-wallet-desktop__wrapper-qr">
        <div class="qr-code">
          <img alt="" :src="wcCode" />
        </div>
        <p class="description">
          Scan QR code from your Mover app. <br />
          Or use another compatible mobile wallet with WalletConnect.
        </p>
      </div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import '@/styles/_general.less';

import Vue from 'vue';
import QRCode from 'qrcode';
import { mapGetters, mapState, mapActions } from 'vuex';

import WalletConnectProvider from '@walletconnect/web3-provider';
import { InitWalletPayload } from '@/store/modules/account/actions/wallet';
import { InitCallbacks } from '@/web3/callbacks';

import { ContentWrapper } from '@/components/layout';
import { APIKeys } from '@/settings';

export default Vue.extend({
  name: 'ConnectWallet',
  components: {
    ContentWrapper
  },
  data() {
    return {
      wcCode: ''
    };
  },
  computed: {
    ...mapState('account', ['detectedProvider', 'addresses', 'web3Modal']),
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
  async mounted() {
    const qrModal = {} as {
      open: (uri: string) => Promise<void>;
      close: () => void;
    };
    qrModal.open = async (uri: string) => {
      const qrCodeUri = await QRCode.toDataURL(uri);
      this.wcCode = qrCodeUri;
    };
    qrModal.close = () => {
      console.info('Modal closed');
    };
    const provider = new WalletConnectProvider({
      infuraId: APIKeys.INFURA_PROJECT_ID,
      qrcodeModal: qrModal
    });

    provider.enable().then(async () => {
      console.info('User enabled WC provider by QR');
      console.log(provider);
      const providerWithCb = await InitCallbacks(provider);
      await this.initWallet({
        provider: providerWithCb.provider,
        providerBeforeCloseCb: providerWithCb.onDisconnectCb,
        injected: false
      } as InitWalletPayload);
    });
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
        infuraId: APIKeys.INFURA_PROJECT_ID
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
    async otherProvider(): Promise<void> {
      const provider = await this.web3Modal.connect();
      console.log('NEW PROVIDER');
      console.log(provider);
      const providerWithCb = await InitCallbacks(provider);
      await this.initWallet({
        provider: providerWithCb.provider,
        providerBeforeCloseCb: providerWithCb.onDisconnectCb,
        injected: provider.isMetaMask
      } as InitWalletPayload);
    }
  }
});
</script>
