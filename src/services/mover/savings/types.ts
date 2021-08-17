import { MoverResponse } from '../responses';

export type SavingsMonthBalanceItem = {
  type: 'savings_month_balance_item';
  balance: number;
  earned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type SavingsActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type SavingsInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<SavingsMonthBalanceItem>;
  actionHistory: Array<SavingsActionHistoryItem>;
  avg30DaysAPY: number;
};
export type SavingsInfoResponse = MoverResponse<SavingsInfo>;

export type SavingsHourlyBalancesItem = {
  type: 'savings_hourly_balance_item';
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type SavingsReceipt = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<SavingsHourlyBalancesItem>;
  monthActionHistory: Array<SavingsActionHistoryItem>;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};
export type SavingsReceiptResponse = MoverResponse<SavingsReceipt>;
