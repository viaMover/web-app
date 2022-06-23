import { TransactionReceipt } from 'web3-eth';
import { Contract, ContractSendMethod } from 'web3-eth-contract';

export type ERC20ContractMethods = {
  approve(spender: string, amount: string): ContractMethod;
  allowance(owner: string, spender: string): ContractMethod<string>;
  balanceOf(owner: string): ContractMethod<string>;
};

export type AnyFn = () => Promise<unknown>;

export type ContractMethod<T = void> = Omit<ContractSendMethod, 'call'> & {
  call(
    options?: {
      from?: string;
      gasPrice?: string;
      gas?: number;
    },
    callback?: (err: Error, result: T) => void
  ): Promise<T>;
};

export type CustomContractType<M> = Omit<
  Contract,
  'methods' | 'clone' | 'deploy'
> & {
  methods: M;
};

export type SubsidizedTransactionExecutionResult = {
  txID?: string;
  queueID?: string;
};

export type TransactionResult =
  | TransactionReceipt
  | SubsidizedTransactionExecutionResult;

export const isOnChainTransaction = (
  result: TransactionResult
): result is TransactionReceipt => {
  return 'transactionHash' in result;
};
