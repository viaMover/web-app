import { MoverResponse } from '../../responses';

export type EthereumMonthBalanceItem = {
  type: 'ethereum_month_balance_item';
  balance: number;
  earned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type EthereumActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type EthereumInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<EthereumMonthBalanceItem>;
  actionHistory: Array<EthereumActionHistoryItem>;
  avg30DaysAPY: number;
};
export type EthereumInfoResponse = MoverResponse<EthereumInfo>;

export type EthereumHourlyBalancesItem = {
  type: 'ethereum_hourly_balance_item';
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type EthereumReceipt = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<EthereumHourlyBalancesItem>;
  monthActionHistory: Array<EthereumActionHistoryItem>;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};
export type EthereumReceiptResponse = MoverResponse<EthereumReceipt>;
