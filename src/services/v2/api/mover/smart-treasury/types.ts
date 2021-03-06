export type TreasuryMonthBonusesItem = {
  type: 'treasury_month_bonuses_item';
  bonusesEarned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type TreasuryActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  amountLP: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type TreasuryInfo = {
  currentTotalStakedMove: number;
  currentTotalStakedMoveLP: number;
  currentStakedMove: number;
  currentStakedMoveLP: number;
  earnedTotal: number;
  earnedThisMonth: number;
  earnedToday: number;
  spentTotal: number;
  spentThisMonth: number;
  spentToday: number;
  last12MonthsBonuses: Array<TreasuryMonthBonusesItem>;
  actionHistory: Array<TreasuryActionHistoryItem> | undefined;
};

export type TreasuryInfoAPIResponse = {
  currentTotalStakedMove: number;
  currentTotalStakedMoveLP: number;
  currentStakedMove: number;
  currentStakedMoveLP: number;
  earnedTotal: number;
  earnedThisMonth: number;
  earnedToday: number;
  spentTotal: number;
  spentThisMonth: number;
  spentToday: number;
  last12MonthsBonuses: Array<{
    bonusesEarned: number;
    snapshotTimestamp: number;
    year: number;
    month: number;
  }>;
  actionHistory: Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
    amountLP: number;
    txId: string;
    block: number;
    timestamp: number;
  }>;
};

export type TreasuryHourlyBalancesItem = {
  type: 'treasury_hourly_balance_item';
  bonusEarned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type TreasuryReceipt = {
  endOfMonthBalanceMove: number;
  endOfMonthBalanceMoveLP: number;
  earnedThisMonth: number;
  hourlyBalances: Array<TreasuryHourlyBalancesItem> | undefined;
  monthActionHistory: Array<TreasuryActionHistoryItem> | undefined;
  totalDepositsMove: number;
  totalWithdrawalsMove: number;
  totalDepositsMoveLP: number;
  totalWithdrawalsMoveLP: number;
  spentThisMonth: number;
  avgDailyEarnings: number;
  avgDailySpendings: number;
};

export type TreasuryReceiptAPIResponse = {
  endOfMonthBalanceMove: number;
  endOfMonthBalanceMoveLP: number;
  earnedThisMonth: number;
  hourlyBalances: Array<{
    bonusEarned: number;
    snapshotTimestamp: number;
    year: number;
    month: number;
    day: number;
    hour: number;
  }>;
  monthActionHistory: Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
    amountLP: number;
    txId: string;
    block: number;
    timestamp: number;
  }>;
  totalDepositsMove: number;
  totalWithdrawalsMove: number;
  totalDepositsMoveLP: number;
  totalWithdrawalsMoveLP: number;
  spentThisMonth: number;
  avgDailyEarnings: number;
  avgDailySpendings: number;
};
