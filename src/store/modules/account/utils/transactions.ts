import orderBy from 'lodash-es/orderBy';
import uniqBy from 'lodash-es/uniqBy';

import { Transaction } from '@/wallet/types';

export const sortAndDeduplicateTransactions = (
  txns: Array<Transaction>
): Array<Transaction> => {
  const deduplicatedTransactions = uniqBy<Transaction>(
    txns,
    (txn) => txn.uniqHash
  );

  return orderBy<Transaction>(
    deduplicatedTransactions,
    ['timestamp', 'nonce', 'uniqHash'],
    ['desc', 'desc', 'desc']
  );
};
