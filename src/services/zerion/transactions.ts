import { FeeData, TransactionStatus, TransactionUnknown } from '@/wallet/types';
import { ZerionTransaction, ZerionTransactionsReceived } from './responses';
import find from 'lodash-es/find';

import { Transaction, TransactionTypes } from '@/wallet/types';

const mapStatus = (status: string): TransactionStatus => {
  switch (status) {
    case 'confirmed':
      return 'confirmed';
    case 'failed':
      return 'failed';
    case 'pending':
      return 'pending';
    default:
      console.error(`Unexpected transaction status: ${status}`);
      return 'failed';
  }
};

const feeMap = (fee: { value: number; price: number }): FeeData => ({
  feeInWEI: String(fee.value),
  ethPrice: String(fee.price)
});

export const mapZerionTxns = (
  data: ZerionTransactionsReceived
): Array<Transaction> => {
  let txns: Transaction[] = [];

  data.payload.transactions.forEach((t) => {
    const tradeTxns = parseTradeTransaction(t);
    if (tradeTxns !== undefined) {
      txns = txns.concat(tradeTxns);
      return;
    }

    const receiveTxns = parseReceiveTransaction(t);
    if (receiveTxns !== undefined) {
      txns = txns.concat(receiveTxns);
      return;
    }

    const sendTxns = parseSendTransaction(t);
    if (sendTxns !== undefined) {
      txns = txns.concat(sendTxns);
      return;
    }

    const authTxns = parseAuthorizeTransaction(t);
    if (authTxns !== undefined) {
      txns = txns.concat(authTxns);
      return;
    }

    const unknownTxns = tryToParseToUnknown(t);
    if (unknownTxns !== undefined) {
      //txns = txns.concat(unknownTxns);
      console.log('Unknown txns:');
      console.log(unknownTxns);
      return;
    }
  });

  console.log('txns:', txns);

  return txns;
};

const parseTradeTransaction = (
  tx: ZerionTransaction
): Transaction[] | undefined => {
  if (tx.type === 'trade' && tx.changes.length > 1) {
    return tx.changes
      .sort((c1, c2) => {
        if (c1.direction === 'out' && c2.direction === 'in') {
          return -1;
        }
        if (c1.direction === 'in' && c2.direction === 'out') {
          return +1;
        }

        return 0;
      })
      .map((c, ind) => {
        if (ind === 0) {
          return {
            asset: {
              address: c.asset.asset_code,
              decimals: c.asset.decimals,
              symbol: c.asset.symbol,
              change: String(c.value),
              iconURL: c.asset.icon_url ?? '',
              price: String(c.price ?? '0'),
              direction: c.direction
            },
            blockNumber: String(tx.block_number),
            hash: tx.hash,
            uniqHash: `${tx.hash}-${ind}`,
            nonce: String(tx.nonce),
            timestamp: tx.mined_at,
            type: TransactionTypes.swapERC20,
            fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
            status: mapStatus(tx.status),
            isOffchain: false
          };
        } else {
          return {
            asset: {
              address: c.asset.asset_code,
              decimals: c.asset.decimals,
              symbol: c.asset.symbol,
              change: String(c.value),
              iconURL: c.asset.icon_url ?? '',
              price: String(c.price ?? '0'),
              direction: c.direction
            },
            blockNumber: String(tx.block_number),
            hash: tx.hash,
            uniqHash: `${tx.hash}-${ind}`,
            from: tx.address_from,
            nonce: String(tx.nonce),
            to: tx.address_to,
            timestamp: tx.mined_at,
            type: TransactionTypes.transferERC20,
            fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
            status: mapStatus(tx.status),
            isOffchain: false
          };
        }
      });
  }
  if (tx.type === 'trade' && tx.changes.length === 1) {
    const c = tx.changes[0];
    return [
      {
        asset: {
          address: c.asset.asset_code,
          decimals: c.asset.decimals,
          symbol: c.asset.symbol,
          change: String(c.value),
          iconURL: c.asset.icon_url ?? '',
          price: String(c.price ?? '0'),
          direction: c.direction
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        from: tx.address_from,
        nonce: String(tx.nonce),
        to: tx.address_to,
        timestamp: tx.mined_at,
        type: TransactionTypes.transferERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false
      }
    ];
  }
  return undefined;
};

const parseReceiveTransaction = (
  tx: ZerionTransaction
): Transaction[] | undefined => {
  if (tx.type === 'receive' && tx.changes.length === 1) {
    const c = tx.changes[0];
    return [
      {
        asset: {
          address: c.asset.asset_code,
          decimals: c.asset.decimals,
          symbol: c.asset.symbol,
          change: String(c.value),
          iconURL: c.asset.icon_url ?? '',
          price: String(c.price ?? '0'),
          direction: c.direction
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        from: tx.address_from,
        nonce: String(tx.nonce),
        to: tx.address_to,
        timestamp: tx.mined_at,
        type: TransactionTypes.transferERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false
      }
    ];
  }
  return undefined;
};

const parseAuthorizeTransaction = (
  tx: ZerionTransaction
): Transaction[] | undefined => {
  if (tx.type === 'authorize') {
    return [
      {
        asset: {
          address: tx.meta.asset.asset_code,
          decimals: tx.meta.asset.decimals,
          iconURL: tx.meta.asset.icon_url ?? '',
          symbol: tx.meta.asset.symbol
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        nonce: String(tx.nonce),
        timestamp: tx.mined_at,
        type: TransactionTypes.approvalERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false
      }
    ];
  }
  return undefined;
};

const parseSendTransaction = (
  tx: ZerionTransaction
): Transaction[] | undefined => {
  if (tx.type === 'send' && tx.changes.length === 1) {
    const c = tx.changes[0];
    return [
      {
        asset: {
          address: c.asset.asset_code,
          decimals: c.asset.decimals,
          symbol: c.asset.symbol,
          change: String(c.value),
          iconURL: c.asset.icon_url ?? '',
          price: String(c.price ?? '0'),
          direction: c.direction
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        from: tx.address_from,
        nonce: String(tx.nonce),
        to: tx.address_to,
        timestamp: tx.mined_at,
        type: TransactionTypes.transferERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false
      }
    ];
  }
  return undefined;
};

const tryToParseToUnknown = (
  tx: ZerionTransaction
): TransactionUnknown[] | undefined => {
  if (
    (tx.type === 'trade' || tx.type === 'send' || tx.type === 'receive') &&
    tx.changes.length > 0
  ) {
    return tx.changes.map((c, ind) => ({
      asset: {
        address: c.asset.asset_code,
        decimals: c.asset.decimals,
        symbol: c.asset.symbol,
        change: String(c.value),
        iconURL: c.asset.icon_url ?? '',
        price: String(c.price),
        direction: c.direction
      },
      blockNumber: String(tx.block_number),
      hash: tx.hash,
      uniqHash: `${tx.hash}-${ind}`,
      nonce: String(tx.nonce),
      timestamp: tx.mined_at,
      type: TransactionTypes.unknown,
      fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
      status: mapStatus(tx.status),
      isOffchain: false
    }));
  }

  return [
    {
      asset: undefined,
      blockNumber: String(tx.block_number),
      hash: tx.hash,
      uniqHash: `${tx.hash}-${0}`,
      nonce: String(tx.nonce),
      timestamp: tx.mined_at,
      type: TransactionTypes.unknown,
      fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
      status: mapStatus(tx.status),
      isOffchain: false
    }
  ];
};

const potentialNftTransaction = (txns: Array<ZerionTransaction>): boolean =>
  find<ZerionTransaction>(txns, (txn) => {
    return true;
    // return (
    //   !txn.protocol &&
    //   (txn.type === 'send' || txn.type === 'receive') &&
    //   txn.meta?.asset?.asset_code !== 'ETH'
    // );
  }) !== undefined;
