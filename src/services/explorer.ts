import * as Sentry from '@sentry/vue';

import { APIKeys } from '@/settings';
import { Network } from '@/utils/networkTypes';
import { TokenWithBalance, Transaction } from '@/wallet/types';

import { MoralisExplorer } from './moralis/explorer';
import { InitZerionExplorer } from './zerion/explorer';
export interface Explorer {
  getChartData: (
    assetCode: string,
    nativeCurrency: string,
    chartTypes: string
  ) => void;
  refreshWalletData: () => void;
}

export const BuildExplorer = async (
  accountAddress: string,
  nativeCurrency: string,
  network: Network,
  setTransactions: (txns: Array<Transaction>) => void,
  updateTransactions: (txns: Array<Transaction>) => void,
  removeTransactions: (txns: Array<string>) => void,
  setTokens: (tokens: Array<TokenWithBalance>) => void,
  updateTokens: (tokens: Array<TokenWithBalance>) => void,
  removeTokens: (tokens: Array<string>) => void,
  setChartData: (chartData: Record<string, Array<[number, number]>>) => void,
  setIsTransactionsListLoaded: (val: boolean) => void
): Promise<Explorer> => {
  const moralisExplorer = new MoralisExplorer(
    accountAddress,
    nativeCurrency,
    network,
    APIKeys.MORALIS_API_KEY,
    setTransactions,
    setIsTransactionsListLoaded,
    setTokens,
    setChartData
  );

  try {
    await moralisExplorer.init();
    return moralisExplorer;
  } catch (error) {
    const errText = error instanceof Error ? error.message : String(error);
    console.error(`can't init moralis explorer: ${errText}`);
    Sentry.captureException(`can't init moralis explorer: ${errText}`);
  }

  // For zerion we assume that transactions are loaded from start
  setIsTransactionsListLoaded(true);

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
    setChartData
  );
};
