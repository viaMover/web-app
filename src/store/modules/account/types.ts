import Fuse from 'fuse.js';
import Web3 from 'web3';

import { PowercardState } from '@/services/chain';
import { TreasuryInfo, TreasuryReceipt } from '@/services/mover';
import { Explorer } from '@/services/zerion/explorer';
import { NetworkInfo } from '@/utils/networkTypes';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import { GasData, Token, TokenWithBalance, Transaction } from '@/wallet/types';

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

export type ProviderData = {
  web3: Web3;
  pureProvider: any;
  providerBeforeClose: () => void;
};

export type Avatar = {
  id: string;
  className: string;
} & (
  | { type: 'symbol'; symbol: string }
  | { type: 'image'; imageSrc: string; imageAlt: string }
);

export type TokenInfo = {
  color: string;
  marketCap: number;
};

export type AccountStoreState = {
  web3Modal: any;

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
  tokenInfoMap: Record<string, TokenInfo> | undefined;
  provider: ProviderData | undefined;
  isDetecting: boolean;
  isWalletLoading: boolean;
  refreshError: undefined | string;

  nativeCurrency: 'usd';
  // main prices in native currency
  ethPrice: undefined | string;
  movePriceInWeth: undefined | string;
  usdcPriceInWeth: undefined | string;
  slpPriceInWeth: undefined | string;
  eursPriceInWeth: undefined | string;

  // explorer
  explorer: undefined | Explorer;
  offchainExplorerHanlder: undefined | OffchainExplorerHanler;
  //charts
  chartData: undefined | Record<string, ChartPair[]>;

  gasPrices: GasData | undefined;
  gasUpdating: boolean;
  gasUpdaterHandle: number | undefined;
  gasUpdaterCallers: Array<string>;
  isDebitCardSectionVisible: boolean;
  isDepositCardSectionVisible: boolean;

  // Treasury
  treasuryBalanceMove: string | undefined;
  treasuryBalanceLP: string | undefined;
  treasuryBonus: string | undefined;
  treasuryAPY: string | undefined;
  treasuryTotalStakedMove: string | undefined;
  treasuryTotalStakedMoveEthLP: string | undefined;

  powercardBalance: string | undefined;
  powercardState: PowercardState | undefined;
  powercardActiveTime: number;
  powercardCooldownTime: number;

  isTreasuryInfoLoading: boolean;
  treasuryInfo: TreasuryInfo | undefined;
  treasuryInfoError: string | undefined;

  isTreasuryReceiptLoading: boolean;
  treasuryReceipt: TreasuryReceipt | undefined;
  treasuryReceiptError: string | undefined;
};
