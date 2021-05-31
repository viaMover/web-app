import { ProviderWithCallbacks } from './types';

export const InitCallbacks = async (
  provider: any
): Promise<ProviderWithCallbacks> => {
  const chainChangedHandler = () => {
    console.log('MetaMask - chain has been chainged! Reloading page...');
    window.location.reload();
  };

  const disconnectHandler = () => {
    console.log('MetaMask - has been disconnected! Reloading page...');
    window.location.reload();
  };

  const accountsChangedHandler = async (accounts: Array<string>) => {
    console.log('MetaMask - accounts array has been changed!', accounts);
    //window.location.reload();
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
