import { Network } from '@/utils/networkTypes';
import { sameAddress } from '@/utils/address';
import { MOBO_ADDRESS, SUSHI_ADDRESS } from '@/wallet/references/data';
import { Transaction, TransactionTypes } from '@/wallet/types';

export const getTransactionHumanType = (
  t: Transaction,
  network: Network
): string => {
  switch (t.moverType) {
    case 'deposit_savings':
    case 'subsidized_deposit':
      return 'Deposit in Savings';
    case 'withdraw_savings':
    case 'subsidized_withdraw':
      return 'Withdraw from Savings';
    case 'deposit_treasury':
      if (
        (t.type === TransactionTypes.transferERC20 ||
          t.type === TransactionTypes.swapERC20) &&
        (sameAddress(t.asset.address, MOBO_ADDRESS(network)) ||
          sameAddress(t.asset.address, SUSHI_ADDRESS(network)))
      ) {
        return 'Receive';
      }
      return 'Increase Boost';
    case 'withdraw_treasury':
      if (
        (t.type === TransactionTypes.transferERC20 ||
          t.type === TransactionTypes.swapERC20) &&
        (sameAddress(t.asset.address, MOBO_ADDRESS(network)) ||
          sameAddress(t.asset.address, SUSHI_ADDRESS(network)))
      ) {
        return 'Receive';
      }
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
