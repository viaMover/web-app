import { Token } from '@/store/modules/account/types';

export type TokenGroups = {
  favorite: Array<Token>;
  verified: Array<Token>;
  rest: Array<Token>;
};

export type TogglePayload = {
  useWalletTokens: boolean;
};
