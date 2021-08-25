import detectEthereumProvider from '@metamask/detect-provider';
import { getLastProviderFromPersist } from '@/settings';
import { InitCallbacks } from '@/web3/callbacks';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { NavigationGuardNext, Route } from 'vue-router';
import router from '@/router/index';
import { updateIntercomSession } from '@/router/intercom-utils';

export const requireWalletAuth =
  (excludedRouteNames: Array<string>) =>
  async (to: Route, from: Route, next: NavigationGuardNext): Promise<void> => {
    const store = router.app.$store;

    if (excludedRouteNames.includes(to.name ?? '')) {
      try {
        await store.dispatch('account/setIsDetecting', true);

        const ethProvider = await detectEthereumProvider({
          mustBeMetaMask: true
        });
        await store.dispatch('account/setDetectedProvider', ethProvider);
      } finally {
        await store.dispatch('account/setIsDetecting', false);
      }
      next();
      return;
    }

    if (store.getters['account/isWalletConnected']) {
      next();
      updateIntercomSession(store.state['account/currentAddress']);
      return;
    }

    await store.dispatch('account/setIsDetecting', true);
    try {
      const ethProvider = await detectEthereumProvider({
        mustBeMetaMask: true
      });
      await store.dispatch('account/setDetectedProvider', ethProvider);

      const lastSelectedProvider = getLastProviderFromPersist();
      if (lastSelectedProvider !== undefined) {
        console.log(
          `Last selected provider detected: ${lastSelectedProvider}, trying to reconnect...`
        );
        switch (lastSelectedProvider) {
          case 'MetaMask':
            if (ethProvider) {
              const providerWithCb = await InitCallbacks(ethProvider, []);
              await store.dispatch('account/initWallet', {
                provider: providerWithCb.provider,
                providerName: 'MetaMask',
                providerBeforeCloseCb: providerWithCb.onDisconnectCb,
                injected: true
              });
            }
            break;
          case 'WalletConnect': {
            const wcProvider = new WalletConnectProvider({
              infuraId: 'eac548bd478143d09d2c090d09251bf1'
            });
            await wcProvider.enable();
            const providerWithCb = await InitCallbacks(wcProvider, []);
            await store.dispatch('account/initWallet', {
              provider: providerWithCb.provider,
              providerName: 'WalletConnect',
              providerBeforeCloseCb: providerWithCb.onDisconnectCb,
              injected: false
            });
            break;
          }
        }
        await store.dispatch('account/setIsDetecting', false);
        next();
        return;
      }

      await store.dispatch('account/setIsDetecting', false);
      next({ name: 'connect-wallet' });
    } catch {
      await store.dispatch('account/setIsDetecting', false);
      next();
    }
  };
