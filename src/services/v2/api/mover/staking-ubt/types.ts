export type StakingUbtMonthBalanceItem = {
  type: 'staking_ubt_month_balance_item';
  balance: number;
  earned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type StakingUbtActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type StakingUbtInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<StakingUbtMonthBalanceItem>;
  actionHistory: Array<StakingUbtActionHistoryItem> | undefined;
  avg30DaysAPY: number;
};

export type StakingUbtInfoAPIResponse = {
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

export type StakingUbtHourlyBalancesItem = {
  type: 'staking_ubt_hourly_balance_item';
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type StakingUbtReceipt = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<StakingUbtHourlyBalancesItem> | undefined;
  monthActionHistory: Array<StakingUbtActionHistoryItem> | undefined;
  totalDeposits: number;
  totalWithdrawals: number;
  avgDailyEarnings: number;
  paidToTreasury: number;
  savedFees: number;
};

export type StakingUbtReceiptAPIResponse = {
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
