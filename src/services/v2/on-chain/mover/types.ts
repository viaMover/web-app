import { Transaction } from '@/wallet/types';

import { ContractMethod, CustomContractType } from '../types';

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};

export type CompoundEstimateResponse = {
  // @deprecated use `false` when creating new wrapper methods as it is expected to MOVE towards transparent estimation error flow instead of shadowed one
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
  executeSwap(
    _tokenFrom: string,
    _tokenTo: string,
    _amountFrom: string,
    _expectedMinimumReceived: string,
    _convertData: number[]
  ): ContractMethod;
  bridgeAsset(
    _token: string,
    _amount: string,
    _bridgeTxData: number[],
    _relayTarget: string
  ): ContractMethod;
  swapBridgeAsset(
    _tokenFrom: string,
    _tokenTo: string,
    _amountFrom: string,
    _expectedMinimumReceived: string,
    _convertData: number[],
    _bridgeTxData: number[],
    _relayTarget: string
  ): ContractMethod;
}>;

export type AddTransactionToStoreHandler = (tx: Transaction) => Promise<void>;
export type EthPriceGetterHandler = () => string;
