import { TransactionResult } from '@/services/v2/on-chain';
import { Network } from '@/utils/networkTypes';
import { Token, TokenWithBalance } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';

export type ListenerParams = {
  [TransactionState.Approve]: {
    hash?: string;
    tokenAddress: string;
    amount?: string;
  };
  [TransactionState.Swap]: {
    hash?: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAmount: string;
    toAmount: string;
  };
  [TransactionState.Deposit]: {
    hash?: string;
    tokenAddress: string;
    amount: string;
  };
  [TransactionState.Withdraw]: {
    hash?: string;
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
    hash?: string;
    tokenAddress: string;
    amount: string;
  };
  [TransactionState.AwaitingForInput]: {
    nextState: TransactionState;
  };
  // @deprecated: unused for now
  [TransactionState.Rejected]: {
    error: unknown;
    hash?: string;
  };
  // @deprecated: unused for now
  [TransactionState.Confirmed]: TransactionResult;
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

export type TransactionScenarioState = {
  type: TransactionState;
  tokenAddress?: string;
  picture?: PictureDescriptor;
  network: Network;
};
export type DisplayableTransactionScenarioState = {
  index: number;
  type: TransactionState;
  network: Network;
  picture?: PictureDescriptor;
  token: Token | TokenWithBalance;
};
export type TransactionScenario = Array<TransactionScenarioState>;

export type StateChangedHandler<P> = (payload: P) => void;
export type UniversalStateChangedHandler = <
  Type extends keyof ListenerParams,
  Payload extends ListenerParams[Type]
>(
  type: Type,
  params: Payload
) => void;
