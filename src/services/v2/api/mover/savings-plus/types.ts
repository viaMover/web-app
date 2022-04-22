type DepositWithBridgeTransactionData = {
  bridgeTxAddress: string;
  bridgeTxData: string;
  estimatedReceived: string;
  depositFee: string;
  bridgeFee: string;
};

export const isDepositWithBridgeTransactionData = (
  data?: DepositTransactionData
): data is DepositWithBridgeTransactionData => {
  return data !== undefined && 'bridgeFee' in data;
};

type DepositOnlyTransactionData = {
  depositPoolAddress: string;
  depositFee: string;
};

export type DepositTransactionData =
  | DepositWithBridgeTransactionData
  | DepositOnlyTransactionData;

export enum WithdrawExecution {
  Backend = 'backend'
}

export enum WithdrawReasonCode {
  PoolInAnotherChain = 'POOL_IN_ANOTHER_CHAIN'
}

type WithdrawWithBridgeTransactionData = {
  execution: WithdrawExecution;
  reasonCode: WithdrawReasonCode;
  estimatedReceived: string;
  withdrawFee: string;
  bridgeFee: string;
};

type WithdrawOnlyTransactionData = {
  withdrawPoolAddress: string;
  withdrawFee: string;
};

export type WithdrawTransactionData =
  | WithdrawWithBridgeTransactionData
  | WithdrawOnlyTransactionData;

export type SavingsPlusMonthBalanceItem = {
  type: 'savings_plus_month_balance_item';
  balance: number;
  earned: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type SavingsPlusActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type SavingsPlusInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<SavingsPlusMonthBalanceItem>;
  actionHistory: Array<SavingsPlusActionHistoryItem> | undefined;
  avg30DaysAPY: number;
};

export type SavingsPlusInfoAPIResponse = {
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
