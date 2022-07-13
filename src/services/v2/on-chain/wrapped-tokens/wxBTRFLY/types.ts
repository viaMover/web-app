import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type WxBTRFLYContract = CustomContractType<{
  unwrapToBTRFLY(amount: string): ContractMethod;
  realIndex(): ContractMethod<string>;
}>;
