import * as Sentry from '@sentry/vue';

import { Network } from '@/utils/networkTypes';
import { TokenWithBalance, Transaction } from '@/wallet/types';

import { MoralisExplorer } from './moralis/explorer';
import { InitZerionExplorer } from './zerion/explorer';
export interface Explorer {
  getChartData: (
    assetCode: string,
    nativeCurrency: string,
    ChartTypes: string
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
  setChartData: (chartData: Record<string, Array<[number, number]>>) => void
): Promise<Explorer> => {
  const moralisExplorer = new MoralisExplorer(
    accountAddress,
    nativeCurrency,
    network,
    '0NgMT3ZAGjyEaEs4EgJ58QpqFEafmWsmBwAn1kasrYQmJ5MB700CUnCwntLMMU6y',
    setTransactions,
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
