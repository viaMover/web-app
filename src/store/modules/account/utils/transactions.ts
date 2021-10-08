import orderBy from 'lodash-es/orderBy';
import uniqBy from 'lodash-es/uniqBy';

import { Transaction, TransactionTypes } from '@/wallet/types';

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

export const tryToGetTransactionAssetSymbol = (tx: Transaction): string => {
  switch (tx.type) {
    case TransactionTypes.approvalERC20:
    case TransactionTypes.swapERC20:
    case TransactionTypes.transferERC20:
      return tx.asset.symbol;
    default:
      return '';
  }
};
