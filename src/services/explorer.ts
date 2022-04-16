import * as Sentry from '@sentry/vue';

import { APIKeys, isFeatureEnabled } from '@/settings';
import { NativeCurrency, PriceRecord } from '@/store/modules/account/types';
import { Network } from '@/utils/networkTypes';
import { Token, TokenWithBalance, Transaction } from '@/wallet/types';

import { availableNetworks } from './../wallet/allTokens';
import { MoralisExplorer } from './moralis/explorer';
import { InitZerionExplorer } from './zerion/explorer';
export interface Explorer {
  getChartData: (
    assetCode: string,
    nativeCurrency: string,
    chartsType: string
  ) => void;
  refreshWalletData: () => void;
  hasInfiniteLoader: () => boolean;
  loadMoreTransactions(nativeOnly: boolean): Promise<boolean>;
}

export const BuildExplorer = async (
  accountAddress: string,
  nativeCurrency: NativeCurrency,
  network: Network,
  setTransactions: (txns: Array<Transaction>) => void,
  updateTransactions: (txns: Array<Transaction>) => void,
  removeTransactions: (txns: Array<string>) => void,
  setTokens: (tokens: Array<TokenWithBalance>) => void,
  updateTokens: (tokens: Array<TokenWithBalance>) => void,
  removeTokens: (tokens: Array<string>) => void,
  setChartData: (chartData: Record<string, Array<[number, number]>>) => void,
  setIsTransactionsListLoaded: (val: boolean) => void,
  setIsTokensListLoaded: (val: boolean) => void,
  fetchTokensPriceByContractAddresses: (
    addresses: Array<string>,
    nativeCurrency: NativeCurrency,
    network: Network
  ) => Promise<PriceRecord>,
  localTokens: Array<Token>
): Promise<Explorer> => {
  const tokenNetworks = isFeatureEnabled('isMultichainTokensEnabled', network)
    ? availableNetworks
    : [network];
  const moralisExplorer = new MoralisExplorer(
    accountAddress,
    nativeCurrency,
    network,
    tokenNetworks,
    APIKeys.MORALIS_API_KEY,
    setTransactions,
    updateTransactions,
    setIsTransactionsListLoaded,
    setTokens,
    updateTokens,
    setIsTokensListLoaded,
    setChartData,
    fetchTokensPriceByContractAddresses,
    localTokens
  );

  try {
    await moralisExplorer.init();
    return moralisExplorer;
  } catch (error) {
    const errText = error instanceof Error ? error.message : String(error);
    console.error(`can't init moralis explorer: ${errText}`);
    Sentry.captureException(`can't init moralis explorer: ${errText}`);
  }

  // For zerion we assume that transactions and tokens are loaded from start
  setIsTransactionsListLoaded(true);
  setIsTokensListLoaded(true);

  return InitZerionExplorer(
    accountAddress,
    nativeCurrency,
    network,
    setTransactions,
    updateTransactions,
    removeTransactions,
    setTokens,
    updateTokens,
    removeTokens,
    setChartData,
    fetchTokensPriceByContractAddresses
  );
};
