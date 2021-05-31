import { provider } from 'web3-core';
export type ProviderWithCallbacks = {
  provider: provider;
  onDisconnectCb: () => void;
};
