import { ZerionTransaction, ZerionTransactionsReceived } from './responses';
import find from 'lodash-es/find';
import uniqBy from 'lodash-es/uniqBy';
import orderBy from 'lodash-es/orderBy';
import { Transaction } from '@/store/modules/account/types';

export const HandleZerionTransactionReceived = (
  data: ZerionTransactionsReceived,
  append = false,
  addTransactions: (txns: Array<Transaction>) => void
): void => {
  const dedupedResults = uniqBy<ZerionTransaction>(
    data.payload.transactions,
    (txn) => txn.hash
  );

  const orderedDedupedResults = orderBy<ZerionTransaction>(
    dedupedResults,
    ['minedAt', 'nonce'],
    ['desc', 'desc']
  );

  const txns = orderedDedupedResults.map((t) => {
    return {
      blockNumber: String(t.block_number),
      hash: t.hash,
      from: t.address_from,
      nonce: String(t.nonce),
      to: t.address_to,
      timeStamp: t.mined_at,
      type: t.type,
      value: String(t.meta.amount),
      symbol: t.meta.asset?.asset_code
    } as Transaction;
  });

  addTransactions(txns);
};

const potentialNftTransaction = (txns: Array<ZerionTransaction>): boolean =>
  find<ZerionTransaction>(txns, (txn) => {
    return (
      !txn.protocol &&
      (txn.type === 'send' || txn.type === 'receive') &&
      txn.meta?.asset?.asset_code !== 'ETH'
    );
  }) !== undefined;
