import { TransactionMoveType } from './types';

export const getTransactionHumanType = (t: TransactionMoveType): string => {
  switch (t) {
    case 'deposit_savings':
    case 'subsidized_deposit':
      return 'Deposit in Savings';
    case 'withdraw_savings':
    case 'subsidized_withdraw':
      return 'Withdraw from Savings';
    case 'deposit_treasury':
      return 'Deposit in Treasury';
    case 'withdraw_treasury':
      return 'Withdraw from treasury';
    case 'execute_swap':
    case 'unknown':
    default:
      return '';
  }
};
