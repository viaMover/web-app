import store from '@/store/index';

import { ProviderWithCallbacks } from './types';

export const InitCallbacks = async (
  provider: any
): Promise<ProviderWithCallbacks> => {
  console.info('Creating callbacks');

  const chainChangedHandler = () => {
    console.log('Provider - chain has been chainged! Reloading page...');
    window.location.reload();
  };

  const disconnectHandler = async () => {
    console.log('Provider - has been disconnected! Reloading page...');
    await store.dispatch('account/disconnectWallet');
    window.location.reload();
  };

  const accountsChangedHandler = async (accounts: Array<string>) => {
    console.log('Provider - accounts array has been changed!', accounts);
    const addrs = store.getters['account/getCurrentAddresses'];
    if (addrs.length !== 0) {
      if (accounts.length === 0) {
        await store.dispatch('account/disconnectWallet');
      }
      window.location.reload();
    }
  };

  provider.on('chainChanged', chainChangedHandler);
  provider.on('disconnect', disconnectHandler);
  provider.on('accountsChanged', accountsChangedHandler);

  return {
    provider: provider,
    onDisconnectCb: () => {
      console.info('Disconnect hook of provider');
      provider.removeListener('chainChanged', chainChangedHandler);
      provider.removeListener('disconnect', disconnectHandler);
      provider.removeListener('accountsChanged', accountsChangedHandler);
    }
  } as ProviderWithCallbacks;
};
