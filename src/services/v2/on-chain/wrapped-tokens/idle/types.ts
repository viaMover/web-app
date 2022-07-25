import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type IdleContract = CustomContractType<{
  redeemIdleToken(amount: string): ContractMethod;
  tokenPriceWithFee(accountAddress: string): ContractMethod<string>;
}>;
