import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type dCULTContract = CustomContractType<{
  withdraw(pid: string, amount: string): ContractMethod;
}>;
