<template>
  <content-wrapper class="connect-wallet" page-content-class="centered">
    <a class="logo" href="https://viamover.com" rel="external">
      <picture>
        <img alt="logo" src="@/assets/images/logo.svg" />
      </picture>
    </a>

    <section class="container">
      <div class="left">
        <div class="info">
          <h1 class="title">{{ $t('lblConnectWallet') }}</h1>
          <i18n class="description" path="connect.txtMoverDescription" tag="p">
            <a
              class="link"
              href="https://viamover.com/terms_of_use"
              rel="external help"
              target="_blank"
            >
              {{ $t('connect.lblTermsAndConditions') }}
            </a>
          </i18n>
        </div>

        <div class="button-container">
          <button
            class="button primary"
            type="button"
            @click.prevent="otherProvider"
          >
            {{ $t('connect.btnConnectOtherWallet') }}
          </button>

          <p class="description">{{ $t('connect.lblChooseProvider') }}</p>
        </div>
      </div>
      <div class="right">
        <pu-skeleton
          class="qr-code"
          :loading="wcCode === '' && wcCodeWebp === ''"
          tag="div"
        >
          <picture>
            <source :srcset="wcCodeWebp" type="image/webp" />
            <img alt="QR code" :src="wcCode" />
          </picture>
        </pu-skeleton>
        <i18n
          class="description"
          path="connect.txtQrDescriptionPartOne"
          tag="p"
        >
          <br />
          {{ $t('connect.txtQrDescriptionPartTwo') }}
        </i18n>
      </div>
    </section>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import WalletConnectProvider from '@walletconnect/web3-provider';
import QRCode from 'qrcode';

import { APIKeys } from '@/settings';
import { InitWalletPayload } from '@/store/modules/account/types';
import { InitCallbacks } from '@/web3/callbacks';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'ConnectWallet',
  components: {
    ContentWrapper
  },
  data() {
    return {
      wcCode: '',
      wcCodeWebp: ''
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
          this.wcCode = await QRCode.toDataURL(uri, {
            margin: 0,
            width: 216 * 2,
            type: 'image/png'
          });
          this.wcCodeWebp = `${await QRCode.toDataURL(uri, {
            margin: 0,
            width: 216 * 2,
            type: 'image/webp'
          })} 1x`;
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
