export type TransactionMoveType =
  | 'unknown'
  | 'deposit_treasury'
  | 'execute_swap'
  | 'deposit_savings'
  | 'subsidized_send'
  | 'subsidized_swap'
  | 'subsidized_deposit'
  | 'subsidized_withdraw'
  | 'withdraw_savings'
  | 'withdraw_treasury'
  | 'card_topup';

export type TransactionMoveTypeData = {
  txID: string;
  moverTypes: TransactionMoveType;
};

export type TransationsResponse = {
  status: 'ok' | 'error';
  payload?: TransactionMoveTypeData[];
  error?: string;
};
