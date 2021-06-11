import { Token } from '@/wallet/types';

export type TokenGroups = {
  favorite: Array<Token>;
  verified: Array<Token>;
  rest: Array<Token>;
};

export type TogglePayload = {
  useWalletTokens: boolean;
};
