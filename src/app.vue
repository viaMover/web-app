<template>
  <div id="app">
    <pu-skeleton-theme
      :color="skeletonColor"
      :highlight="skeletonHighlightColor"
    >
      <div class="page">
        <web3-modal-vue
          ref="web3modal"
          cache-provider
          :provider-options="providerOptions"
          :theme="theme"
        />
        <top-message-modal />
        <transition mode="out-in" name="fade">
          <template v-if="showPreload">
            <router-view
              v-if="$route.meta.hasOwnPreload"
              key="preload-custom"
              name="preload"
            />
            <preload-default v-else key="preload-default" />
          </template>
          <router-view v-else key="viewport" />
        </transition>
        <mobile />
      </div>
    </pu-skeleton-theme>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import MewConnect from '@myetherwallet/mewconnect-web-client';
import Portis from '@portis/web3';
import UAuthSPA from '@uauth/js';
import * as UAuthWeb3Modal from '@uauth/web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3ModalVue from 'web3modal-vue';

import { NetworkNotSupportedError } from '@/services/v2/NetworkNotSupportedError';
import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import Mobile from '@/views/mobile.vue';
import PreloadDefault from '@/views/preload/preload-default.vue';

import { TopMessageModal } from './components/modals';
import { sendGlobalTopMessageEvent } from './global-event-bus';
import { addSentryBreadcrumb } from './services/v2/utils/sentry';
import { APIKeys } from './settings';
import { InitWalletPayload, uauthOptions } from './store/modules/account/types';
import { CommonErrors } from './utils/errors';
import { InitCallbacks } from './web3/callbacks';

export default Vue.extend({
  name: 'App',
  components: {
    PreloadDefault,
    Mobile,
    Web3ModalVue,
    TopMessageModal
  },
  data() {
    return {
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
            id: APIKeys.PORTIS_DAPP_ID
          }
        },
        coinbasewallet: {
          package: CoinbaseWalletSDK,
          options: {
            appName: 'Mover App',
            infuraId: APIKeys.INFURA_PROJECT_ID
          }
        },
        metamask: {
          package: {}
        },
        'custom-uauth': {
          display: UAuthWeb3Modal.display,
          connector: UAuthWeb3Modal.connector,
          package: UAuthSPA,
          options: uauthOptions
        },
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: APIKeys.INFURA_PROJECT_ID,
            rpc: {
              137: 'https://matic-mainnet.chainstacklabs.com',
              250: 'https://rpc.ftm.tools/'
            }
          }
        }
      }
    };
  },
  computed: {
    ...mapState({
      colors: 'colors',
      theme: 'theme'
    }),
    ...mapGetters('account', {
      isWalletReady: 'isWalletReady',
      entireBalanceNative: 'entireBalance'
    }),
    showPreload(): boolean {
      return !this.isWalletReady && !this.$route.meta.skipPreloadScreen;
    },
    pageTitle(): string {
      const entireBalance = this.entireBalanceNative;
      if (greaterThan(entireBalance, 0)) {
        return `$${formatToNative(entireBalance)} • ${this.$t(
          'lblPageTitleSuffix'
        )}`;
      } else {
        return this.$t('lblPageTitleDefault') as string;
      }
    },
    skeletonColor(): string {
      return this.colors['skeleton-color'] ?? 'var(--color-skeleton-color)';
    },
    skeletonHighlightColor(): string {
      return (
        this.colors['skeleton-highlight-color'] ??
        'var(--color-skeleton-highlight-color)'
      );
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
  async mounted() {
    this.setI18n(this.$i18n);
    this.setPageTitle(this.pageTitle);
    this.setIsDetecting(true);
    this.$nextTick(async () => {
      const web3modal = this.$refs.web3modal as any;
      UAuthWeb3Modal.registerWeb3Modal(web3modal);
      this.setWeb3Modal(web3modal);
      if (web3modal.cachedProvider) {
        try {
          const provider = await web3modal.connect();
          const providerWithCb = await InitCallbacks(provider);
          await this.initWallet({
            provider: providerWithCb.provider,
            providerBeforeCloseCb: providerWithCb.onDisconnectCb,
            injected: false
          } as InitWalletPayload);
        } catch (error) {
          addSentryBreadcrumb({
            type: 'error',
            category: 'app',
            message: "Can't connect to cached provider",
            data: {
              error
            }
          });
          web3modal.clearCachedProvider();
          await new UAuthSPA(uauthOptions)
            .logout(uauthOptions)
            .catch((error) => {
              addSentryBreadcrumb({
                type: 'warning',
                category: 'app',
                message: 'Failed to log out from Unstoppable Domains client',
                data: {
                  error
                }
              });
            });
          Object.entries(localStorage)
            .map((x) => x[0])
            .filter((x) => x.startsWith('-walletlink'))
            .forEach((x) => localStorage.removeItem(x));

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
                code: CommonErrors.CACHED_PROVIDER_CONNECT_ERROR
              }) as string,
              'error'
            );
          }
        }
      }
      this.setIsDetecting(false);
    });
    await this.initTheme();
  },
  methods: {
    ...mapActions({
      setI18n: 'setI18n',
      initTheme: 'initTheme'
    }),
    ...mapMutations('account', {
      setWeb3Modal: 'setWeb3Modal',
      setIsDetecting: 'setIsDetecting'
    }),
    ...mapActions('account', {
      initWallet: 'initWallet'
    }),
    setPageTitle(title: string): void {
      document.title = title;
    }
  }
});
</script>
