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
              class="link medium"
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

import UAuthSPA from '@uauth/js';
import WalletConnectProvider from '@walletconnect/web3-provider';
import QRCode from 'qrcode';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { NetworkNotSupportedError } from '@/services/v2/NetworkNotSupportedError';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { APIKeys } from '@/settings';
import { InitWalletPayload, uauthOptions } from '@/store/modules/account/types';
import { CommonErrors } from '@/utils/errors';
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
      },
      rpc: {
        137: 'https://matic-mainnet.chainstacklabs.com',
        250: 'https://rpc.ftm.tools/'
      }
    });
    provider.enable().then(async () => {
      console.info('User enabled WC provider by QR');
      addSentryBreadcrumb({
        type: 'info',
        category: 'connect-wallet.wcProvider',
        message: 'User enabled WC provider by QR',
        data: {
          provider
        }
      });
      try {
        const providerWithCb = await InitCallbacks(provider);
        await this.initWallet({
          provider: providerWithCb.provider,
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: false
        } as InitWalletPayload);
        localStorage.setItem('WEB3_CONNECT_CACHED_PROVIDER', '"walletconnect"');
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'app',
          message: "Can't init WC provider",
          data: {
            error
          }
        });
        this.web3Modal.clearCachedProvider();
        Object.entries(localStorage)
          .map((x) => x[0])
          .filter((x) => x.startsWith('-walletlink'))
          .forEach((x) => localStorage.removeItem(x));
        sendGlobalTopMessageEvent(
          this.$t('errors.default', {
            code: CommonErrors.WC_PROVIDER_INIT_ERROR
          }) as string,
          'error'
        );
      }
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
      let provider;
      try {
        provider = await this.web3Modal.connect();
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'connect-wallet.otherProvider',
          message: "Can't connect to provider",
          data: {
            error
          }
        });
        await new UAuthSPA(uauthOptions).logout(uauthOptions).catch((error) => {
          addSentryBreadcrumb({
            type: 'warning',
            category: 'app',
            message: 'Failed to log out from Unstoppable Domains client',
            data: {
              error
            }
          });
        });
        sendGlobalTopMessageEvent(
          this.$t('errors.default', {
            code: CommonErrors.OTHER_PROVIDER_CONNECT_ERROR
          }) as string,
          'error'
        );
        return;
      }
      addSentryBreadcrumb({
        type: 'info',
        category: 'connect-wallet.otherProvider',
        message: 'Connected to provider',
        data: {
          provider
        }
      });
      try {
        const providerWithCb = await InitCallbacks(provider);
        await this.initWallet({
          provider: providerWithCb.provider,
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: provider.isMetaMask
        } as InitWalletPayload);
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'connect-wallet.otherProvider',
          message: "Can't init wallet",
          data: {
            error
          }
        });
        if (error instanceof NetworkNotSupportedError) {
          sendGlobalTopMessageEvent(
            (this.$t('errors.notSupportedChainId', {
              chainId: error.getChainId()
            }) as string) ?? 'Oh no. Something went wrong',
            'error'
          );
        } else {
          sendGlobalTopMessageEvent(
            this.$t('errors.default', {
              code: CommonErrors.OTHER_PROVIDER_INIT_ERROR
            }) as string,
            'error'
          );
        }
        return;
      }
    }
  }
});
</script>
