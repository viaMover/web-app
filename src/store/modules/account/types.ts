import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import Web3 from 'web3';
import Fuse from 'fuse.js';

import { NetworkInfo } from '@/utils/networkTypes';
import { Token, TokenWithBalance, Transaction, GasData } from '@/wallet/types';

import { Explorer } from '@/services/zerion/explorer';
import {
  SavingsInfo,
  SavingsReceipt,
  TreasuryInfo,
  TreasuryReceipt
} from '@/services/mover';

export type ChartPair = [number, number];

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountData = {
  addresses: Array<string>;
  balance: string | undefined;
  networkId: number | undefined;
};

export type ProviderNames = 'MetaMask' | 'WalletConnect';

export type ProviderData = {
  web3: Web3;
  pureProvider: any;
  providerName: ProviderNames;
  providerBeforeClose: () => void;
};

export type Avatar = {
  symbol: string;
  className: string;
};

export type AccountStoreState = {
  avatar: Avatar | undefined;
  avatars: Array<Avatar>;
  addresses: Array<string>;
  balance: undefined | string;
  networkInfo: undefined | NetworkInfo;
  currentAddress: undefined | string;
  transactions: Array<Transaction>;
  tokens: Array<TokenWithBalance>;
  tokensSearcher: Fuse<TokenWithBalance> | undefined;
  allTokens: Array<Token>;
  allTokensSearcher: Fuse<Token> | undefined;
  tokenColorMap: Record<string, string> | undefined;
  provider: ProviderData | undefined;
  detectedProvider: any | undefined;
  isDetecting: boolean;
  refreshError: undefined | string;

  nativeCurrency: 'usd';
  // main prices in native currency
  ethPrice: undefined | string;
  movePriceInWeth: undefined | string;
  usdcPriceInWeth: undefined | string;
  slpPriceInWeth: undefined | string;

  // explorer
  explorer: undefined | Explorer;
  offchainExplorerHanlder: undefined | OffchainExplorerHanler;
  //charts
  chartData: undefined | Record<string, ChartPair[]>;

  gasPrices: GasData | undefined;
  gasUpdating: boolean;
  isDebitCardSectionVisible: boolean;
  isDepositCardSectionVisible: boolean;

  isSavingsInfoLoading: boolean;
  savingsInfo: SavingsInfo | undefined;
  savingsInfoError: string | undefined;

  isSavingsReceiptLoading: boolean;
  savingsReceipt: SavingsReceipt | undefined;
  savingsReceiptError: string | undefined;

  savingsBalance: string | undefined;
  savingsAPY: string | undefined;
  savingsDPY: string | undefined;

  // Treasury
  treasuryBalanceMove: string | undefined;
  treasuryBalanceLP: string | undefined;
  treasuryBonus: string | undefined;
  treasuryAPY: string | undefined;
  treasuryTotalStakedMove: string | undefined;
  treasuryTotalStakedMoveEthLP: string | undefined;

  isTreasuryInfoLoading: boolean;
  treasuryInfo: TreasuryInfo | undefined;
  treasuryInfoError: string | undefined;

  isTreasuryReceiptLoading: boolean;
  treasuryReceipt: TreasuryReceipt | undefined;
  treasuryReceiptError: string | undefined;
};
