import { Transaction } from '@/wallet/types';

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
    _poolAddress: string,
    _tokenFrom: string,
    _amount: string,
    _expectedMinimumReceived: string,
    _bytes: Array<number>
  ): ContractMethod;
  withdrawFromPool(_poolAddress: string, _amount: string): ContractMethod;
  depositToTreasury(
    _tokenMoveAmount: string,
    _tokenMoveEthAmount: string
  ): ContractMethod;
  claimAndBurn(_amount: string): ContractMethod;
}>;

export type AddTransactionToStoreHandler = (tx: Transaction) => Promise<void>;
export type EthPriceGetterHandler = () => string;
