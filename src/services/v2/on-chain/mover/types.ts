import { ContractMethod, CustomContractType } from '../types';

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};

export type CompoundEstimateResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
};

export type CompoundEstimateWithUnwrapResponse = CompoundEstimateResponse & {
  unwrapGasLimit: string;
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
