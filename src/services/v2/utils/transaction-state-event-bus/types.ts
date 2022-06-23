import { TransactionResult } from '@/services/v2/on-chain';
import { Network } from '@/utils/networkTypes';

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
  };
  // @deprecated: unused for now
  [TransactionState.Confirmed]: TransactionResult;
};

export enum TransactionState {
  Started = 'started',
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
  tokenAddress: string;
  network: Network;
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
