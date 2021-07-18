<script lang="ts">
import { mapActions, mapMutations } from 'vuex';
import Vue from 'vue';
import detectEthereumProvider from '@metamask/detect-provider';
import Cookies from 'js-cookie';
import { COOKIE_LAST_PROVIDER } from '@/store/modules/account/actions/wallet';
import { InitCallbacks } from '@/web3/callbacks';
import WalletConnectProvider from '@walletconnect/web3-provider';

export default Vue.extend({
  name: 'Wallet',
  mounted() {
    (async () => {
      this.setIsDetecting(true);
      try {
        const ethProvider = await detectEthereumProvider({
          mustBeMetaMask: true
        });
        if (ethProvider) {
          const provider = ethProvider as any;
          console.log('found ethereum provider!');
          this.setDetectedProvider(ethProvider);

          // const accounts = await provider.web3.eth.getAccounts()();
          // const connected = accounts.length > 0;
          //
          // if (connected) {
          // const providerWithCb = await InitCallbacks(ethProvider);
          // this.initWallet({
          //     provider: providerWithCb.provider,
          //     providerName: 'MetaMask',
          //     providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          //     injected: true
          // } as InitWalletPayload);
          // }
        } else {
          this.setDetectedProvider(undefined);
        }
        this.startGasListening();

        const lastSelectedProvider = Cookies.get(COOKIE_LAST_PROVIDER);
        if (lastSelectedProvider !== undefined) {
          console.log(
            `Last selected provider detected: ${lastSelectedProvider}, trying to reconnect...`
          );
          switch (lastSelectedProvider) {
            case 'MetaMask':
              if (ethProvider) {
                const providerWithCb = await InitCallbacks(ethProvider, []);
                await this.initWallet({
                  provider: providerWithCb.provider,
                  providerName: 'MetaMask',
                  providerBeforeCloseCb: providerWithCb.onDisconnectCb,
                  injected: true
                });
              }
              break;
            case 'WalletConnect': {
              const WCprovider = new WalletConnectProvider({
                infuraId: 'eac548bd478143d09d2c090d09251bf1'
              });
              await WCprovider.enable();
              const providerWithCb = await InitCallbacks(WCprovider, []);
              //  Enable session (triggers QR Code modal)
              await this.initWallet({
                provider: providerWithCb.provider,
                providerName: 'WalletConnect',
                providerBeforeCloseCb: providerWithCb.onDisconnectCb,
                injected: false
              });
              break;
            }
          }
        }
      } finally {
        this.setIsDetecting(false);
      }
    })();
  },
  methods: {
    ...mapMutations('account', {
      setDetectedProvider: 'setDetectedProvider',
      setIsDetecting: 'setIsDetecting'
    }),
    ...mapActions('account', {
      initWallet: 'initWallet',
      startGasListening: 'startGasListening'
    })
  },
  render() {
    return {} as any;
  }
});
</script>
