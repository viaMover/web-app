import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type gALCXContract = CustomContractType<{
  unstake(amount: string): ContractMethod;
  exchangeRate(): ContractMethod<string>;
}>;
