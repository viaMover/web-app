import { Contract, ContractSendMethod } from 'web3-eth-contract';

export type ERC20ContractMethods = {
  approve(spender: string, amount: string): ContractMethod;
  allowance(owner: string, spender: string): ContractMethod<string>;
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

export type CompoundEstimateResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
};

export type CompoundEstimateWithUnwrapResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
  unwrapGasLimit: string;
};

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};

export type HolyHandContract = CustomContractType<{
  depositToPool(
    poolAddress: string,
    tokenFrom: string,
    amount: string,
    expectedMinimumReceived: string,
    bytes: Array<number>
  ): ContractMethod;
}>;
