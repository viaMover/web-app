<script lang="ts">
import { mapActions, mapMutations } from 'vuex';
import Vue from 'vue';
import detectEthereumProvider from '@metamask/detect-provider';

export default Vue.extend({
  name: 'Wallet',
  mounted() {
    (async () => {
      this.setIsDetecting(true);
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
      this.setIsDetecting(false);
    })();
  },
  methods: {
    ...mapMutations('account', {
      setDetectedProvider: 'setDetectedProvider',
      setIsDetecting: 'setIsDetecting'
    }),
    ...mapActions('account', {
      initWallet: 'initWallet'
    })
  },
  render() {
    return {} as any;
  }
});
</script>
