import { SmallTokenInfo, Transaction } from '@/wallet/types';

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

export type UnwrappedData = {
  unwrappedToken: SmallTokenInfo;
  amountInWei: string;
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
  // l2 variant
  swapBridgeAsset(
    _tokenFrom: string,
    _tokenTo: string,
    _amountFrom: string,
    _expectedMinimumReceived: string,
    _convertData: number[],
    _bridgeTxData: number[],
    _relayTarget: string
  ): ContractMethod;
  // mainnet variant
  swapBridgeAsset(
    _tokenFrom: string,
    _tokenTo: string,
    _amountFrom: string,
    _expectedMinimumReceived: string,
    _convertData: number[],
    _bridgeTxData: number[],
    _relayTarget: string,
    // difference between stable and bridged amounts as a lower bound
    _minToMint: string,
    // minimum amount after bridge
    _minDy: string
  ): ContractMethod;
  cardTopUp(
    _accountAddress: string,
    _inputCurrencyAddress: string,
    _inputAmountInWEI: string,
    _expectedMinimumReceived: string,
    _bytesData: number[]
  ): ContractMethod;
}>;

export type AddTransactionToStoreHandler = (tx: Transaction) => Promise<void>;
export type EthPriceGetterHandler = () => string;
