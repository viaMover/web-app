import { ZerionTransaction, ZerionTransactionsReceived } from './responses';
import find from 'lodash-es/find';

import { Transaction } from '@/wallet/types';

export const mapZerionTxns = (
  data: ZerionTransactionsReceived
): Array<Transaction> => {
  const txns = data.payload.transactions.map((t) => {
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

  return txns;
};

const potentialNftTransaction = (txns: Array<ZerionTransaction>): boolean =>
  find<ZerionTransaction>(txns, (txn) => {
    return (
      !txn.protocol &&
      (txn.type === 'send' || txn.type === 'receive') &&
      txn.meta?.asset?.asset_code !== 'ETH'
    );
  }) !== undefined;
