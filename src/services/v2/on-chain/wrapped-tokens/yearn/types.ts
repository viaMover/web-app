import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type YearnVaultContract = CustomContractType<{
  withdraw(amount: string): ContractMethod;
  pricePerShare(): ContractMethod<string>;
}>;
