import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { lookupAddress } from '@/wallet/references/data';
import { Transaction, TransactionTypes } from '@/wallet/types';

export const getTransactionHumanType = (
  t: Transaction,
  network: Network
): string => {
  if (t.status === 'pending') {
    return 'Pending';
  }
  switch (t.moverType) {
    case 'deposit_savings':
    case 'subsidized_deposit':
      return 'Deposit in Savings';
    case 'withdraw_savings':
    case 'subsidized_withdraw':
      return 'Withdraw from Savings';
    case 'deposit_savings_plus_direct':
    case 'deposit_savings_plus_bridged':
      return 'Deposit in Savings Plus';
    case 'withdraw_savings_plus_direct':
    case 'withdraw_savings_plus_bridged':
      return 'Withdraw from Savings Plus';
    case 'deposit_ubt':
      return 'Stake UBT';
    case 'withdraw_ubt':
      return 'Unstake UBT';
    case 'deposit_treasury':
      if (
        (t.type === TransactionTypes.transferERC20 ||
          t.type === TransactionTypes.swapERC20) &&
        (sameAddress(t.asset.address, lookupAddress(network, 'MOBO_ADDRESS')) ||
          sameAddress(
            t.asset.address,
            lookupAddress(network, 'SUSHI_TOKEN_ADDRESS')
          ))
      ) {
        return 'Receive';
      }
      return 'Increase Boost';
    case 'withdraw_treasury':
      if (
        (t.type === TransactionTypes.transferERC20 ||
          t.type === TransactionTypes.swapERC20) &&
        (sameAddress(t.asset.address, lookupAddress(network, 'MOBO_ADDRESS')) ||
          sameAddress(
            t.asset.address,
            lookupAddress(network, 'SUSHI_TOKEN_ADDRESS')
          ))
      ) {
        return 'Receive';
      }
      return 'Decrease Boost';
    case 'card_topup':
      return 'Card top up';
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
