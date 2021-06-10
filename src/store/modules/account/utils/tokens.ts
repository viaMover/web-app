import { TokenWithBalance } from './../types';
import uniqBy from 'lodash-es/uniqBy';

export const SortAndDedupedTokens = (
  tokens: Array<TokenWithBalance>
): Array<TokenWithBalance> => {
  const dedupedResults = uniqBy<TokenWithBalance>(tokens, (t) => t.address);

  return dedupedResults;
};
