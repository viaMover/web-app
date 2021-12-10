import { isFeatureEnabled } from '@/settings';

import { EarningsProviderName } from './types';

const getActiveProviders = (): Array<EarningsProviderName> => {
  const availableProviders = new Array<EarningsProviderName>();
  if (isFeatureEnabled('isEarningsEthereumEnabled')) {
    availableProviders.push(EarningsProviderName.Ethereum);
  }

  if (isFeatureEnabled('isEarningsOlympusEnabled')) {
    availableProviders.push(EarningsProviderName.Olympus);
  }

  return availableProviders;
};

export const ActiveProviders = getActiveProviders();
