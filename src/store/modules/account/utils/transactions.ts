import { Transaction } from '@/wallet/types';
import uniqBy from 'lodash-es/uniqBy';
import orderBy from 'lodash-es/orderBy';

export const SortAndDedupedTransactions = (
  txns: Array<Transaction>
): Array<Transaction> => {
  const dedupedResults = uniqBy<Transaction>(txns, (txn) => txn.hash);

  const orderedDedupedResults = orderBy<Transaction>(
    dedupedResults,
    ['timeStamp', 'nonce'],
    ['desc', 'desc']
  );

  return orderedDedupedResults;
};
