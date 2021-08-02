import { Transaction } from '@/wallet/types';
import uniqBy from 'lodash-es/uniqBy';
import orderBy from 'lodash-es/orderBy';

export const SortAndDedupedTransactions = (
  txns: Array<Transaction>
): Array<Transaction> => {
  const dedupedResults = uniqBy<Transaction>(txns, (txn) => txn.uniqHash);

  const orderedDedupedResults = orderBy<Transaction>(
    dedupedResults,
    ['timestamp', 'nonce', 'uniqHash'],
    ['desc', 'desc', 'desc']
  );

  return orderedDedupedResults;
};
