import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type ReverseRecordsContract = CustomContractType<{
  getNames(_names: Array<string>): ContractMethod<Array<string>>;
}>;
