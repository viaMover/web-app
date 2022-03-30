import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type StakingContract = CustomContractType<{
  stakeUbt(_amount: string): ContractMethod;
  unstakeUbt(_amount: string): ContractMethod;
  getStakingBalance(_owner: string): ContractMethod<string>;
}>;
