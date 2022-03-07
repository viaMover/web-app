import {
  ContractMethod,
  CustomContractType
} from '@/services/v2/on-chain/types';

export type HolySavingsPoolContract = CustomContractType<{
  getDailyAPY(): ContractMethod<string>;
  getDepositBalance(accountAddress: string): ContractMethod<string>;
}>;

export type GetSavingsAPYReturn = {
  apy: string;
  dpy: string;
};
