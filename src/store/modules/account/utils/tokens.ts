import uniqBy from 'lodash-es/uniqBy';

import { TokenWithBalance } from '@/wallet/types';

export const sortAndDeduplicateTokens = (
  tokens: Array<TokenWithBalance>
): Array<TokenWithBalance> => {
  return uniqBy<TokenWithBalance>(tokens, (t) => ({
    address: t.address,
    network: t.network
  }));
};
