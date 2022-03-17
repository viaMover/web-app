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
  actionHistory: Array<SavingsActionHistoryItem> | undefined;
  avg30DaysAPY: number;
};

export type SavingsInfoAPIResponse = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<{
    balance: number;
    earned: number;
    snapshotTimestamp: number;
    year: number;
    month: number;
  }>;
  actionHistory: Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
    txId: string;
    block: number;
    timestamp: number;
  }>;
  avg30DaysAPY: number;
};

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
  hourlyBalances: Array<SavingsHourlyBalancesItem> | undefined;
  monthActionHistory: Array<SavingsActionHistoryItem> | undefined;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};

export type SavingsReceiptAPIResponse = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<{
    balance: number;
    snapshotTimestamp: number;
    year: number;
    month: number;
    day: number;
    hour: number;
  }>;
  monthActionHistory: Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
    txId: string;
    block: number;
    timestamp: number;
  }>;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};
