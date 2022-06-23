import { ContractMethod, CustomContractType } from '@/services/v2/on-chain';

export type RegistryContract = CustomContractType<{
  balanceOf(_owner: string): ContractMethod<string>;
  reverseOf(_addr: string): ContractMethod<string>;
  tokenURI(_tokenId: string): ContractMethod<string>;
}>;
