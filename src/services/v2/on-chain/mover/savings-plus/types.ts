import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type SavingsPlusPoolContract = CustomContractType<{
  getDepositBalance(accountAddress: string): ContractMethod<string>;
}>;
