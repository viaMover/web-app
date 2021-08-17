import { Transaction, TransactionTypes } from '@/wallet/types';

export const getTransactionHumanType = (t: Transaction): string => {
  switch (t.moverType) {
    case 'deposit_savings':
    case 'subsidized_deposit':
      return 'Deposit in Savings';
    case 'withdraw_savings':
    case 'subsidized_withdraw':
      return 'Withdraw from Savings';
    case 'deposit_treasury':
      return 'Increase Boost';
    case 'withdraw_treasury':
      return 'Decrease Boost';
    case 'execute_swap':
    case 'unknown':
    default:
      if (t.type === TransactionTypes.swapERC20) {
        return 'Swap';
      }
      if (t.type === TransactionTypes.transferERC20) {
        if (t.asset.direction === 'in') {
          return 'Receive';
        }
        if (t.asset.direction === 'out') {
          return 'Send';
        }
        if (t.asset.direction === 'self') {
          return 'Self';
        }
      }
      if (t.type === TransactionTypes.approvalERC20) {
        return 'Approve';
      }
      return 'Unknown';
  }
};
