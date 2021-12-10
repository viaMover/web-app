import { MoverResponse } from '../../responses';

export type OlympusMonthBalanceItem = {
  type: 'olympus_month_balance_item';
  balance: number;
  earned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type OlympusActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type OlympusInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<OlympusMonthBalanceItem>;
  actionHistory: Array<OlympusActionHistoryItem>;
  avg30DaysAPY: number;
};
export type OlympusInfoResponse = MoverResponse<OlympusInfo>;

export type OlympusHourlyBalancesItem = {
  type: 'olympus_hourly_balance_item';
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type OlympusReceipt = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<OlympusHourlyBalancesItem>;
  monthActionHistory: Array<OlympusActionHistoryItem>;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};
export type OlympusReceiptResponse = MoverResponse<OlympusReceipt>;
