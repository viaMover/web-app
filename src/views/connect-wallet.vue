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
        <i18n class="description" path="connect.txtMoverDescription" tag="p">
          <a href="https://viamover.com/terms_of_use" target="_blank">
            {{ $t('connect.lblTermsAndConditions') }}
          </a>
        </i18n>
        <button
          class="button-active black-link"
          type="button"
          @click.prevent="otherProvider"
        >
          {{ $t('connect.btnConnectOtherWallet') }}
        </button>
        <p class="text">{{ $t('connect.lblChooseProvider') }}</p>
      </div>
      <div class="general-no-wallet-desktop__wrapper-qr">
        <div class="qr-code">
          <img alt="QR code" :src="wcCode" />
        </div>
        <i18n
          class="description"
          path="connect.txtQrDescriptionPartOne"
          tag="p"
        >
          <br />
          {{ $t('connect.txtQrDescriptionPartTwo') }}
        </i18n>
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
    ...mapState('account', ['addresses', 'web3Modal']),
    ...mapGetters('account', ['isWalletConnected'])
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
    const provider = new WalletConnectProvider({
      infuraId: APIKeys.INFURA_PROJECT_ID,
      qrcodeModal: {
        open: async (uri: string) => {
          const qrCodeUri = await QRCode.toDataURL(uri);
          this.wcCode = qrCodeUri;
        },
        close: () => {
          // do nothing.
        }
      }
    });
    provider.enable().then(async () => {
      console.info('User enabled WC provider by QR');
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
    async otherProvider(): Promise<void> {
      const provider = await this.web3Modal.connect();
      console.log('Other provider');
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
