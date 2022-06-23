import { TransactionReceipt } from 'web3-eth';

import { Network } from '@/utils/networkTypes';

export type ListenerParams = {
  [TransactionState.Approve]: {
    tokenAddress: string;
    amount?: string;
  };
  [TransactionState.Swap]: {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAmount: string;
    toAmount: string;
  };
  [TransactionState.Deposit]: {
    tokenAddress: string;
    amount: string;
  };
  [TransactionState.Withdraw]: {
    tokenAddress: string;
    amount: string;
  };
  [TransactionState.Bridge]: {
    tokenAddress: string;
    amount: string;
    fromNetwork: Network;
    toNetwork: Network;
  };
  [TransactionState.TopUp]: {
    tokenAddress: string;
    amount: string;
  };
  [TransactionState.AwaitingForInput]: {
    nextState: TransactionState;
  };
  // @deprecated: unused for now
  [TransactionState.Rejected]: {
    error: unknown;
  };
  // @deprecated: unused for now
  [TransactionState.Confirmed]: {
    receipt?: TransactionReceipt;
  };
};

export enum TransactionState {
  Approve = 'approve',
  Swap = 'swap',
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Bridge = 'bridge',
  TopUp = 'topUp',
  AwaitingForInput = 'awaitingForInput',
  Rejected = 'rejected',
  Confirmed = 'confirmed'
}

export type StateChangedHandler<P> = (payload: P) => void;
