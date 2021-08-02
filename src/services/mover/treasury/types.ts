import { MoverResponse } from '../responses';

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
  last12MonthsBonuses: Array<TreasuryMonthBonusesItem>;
  actionHistory: Array<TreasuryActionHistoryItem>;
};
export type TreasuryInfoResponse = MoverResponse<TreasuryInfo>;

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
  hourlyBalances: Array<TreasuryHourlyBalancesItem>;
  monthActionHistory: Array<TreasuryActionHistoryItem>;
  totalDepositsMove: number;
  totalWithdrawalsMove: number;
  totalDepositsMoveLP: number;
  totalWithdrawalsMoveLP: number;
};
export type TreasuryReceiptResponse = MoverResponse<TreasuryReceipt>;
