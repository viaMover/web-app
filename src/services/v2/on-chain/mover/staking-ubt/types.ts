import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type StakingContract = CustomContractType<{
  deposit(_amount: string): ContractMethod;
  withdraw(_amount: string): ContractMethod;
  getDepositBalance(_owner: string): ContractMethod<string>;
}>;
