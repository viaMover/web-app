import * as Sentry from '@sentry/vue';

import { RootStoreState } from '@/store/types';

export const checkAccountStateIsReady = (
  rootState: RootStoreState
): boolean => {
  if (rootState.account === undefined) {
    console.error('empty account state');
    Sentry.captureException('empty account state');
    return false;
  }

  if (rootState.account.networkInfo?.network === undefined) {
    console.error('empty network');
    Sentry.captureException('empty network');
    return false;
  }

  if (rootState.account.provider?.web3 === undefined) {
    console.error('empty web3 provider');
    Sentry.captureException('empty web3 provider');
    return false;
  }

  if (rootState.account.currentAddress === undefined) {
    console.error('empty current address');
    Sentry.captureException('empty current address');
    return false;
  }

  return true;
};
