import * as Sentry from '@sentry/vue';
import find from 'lodash-es/find';

import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { isSubsidizedAddress } from '@/wallet/actions/subsidized';
import {
  HOLY_HAND_ADDRESS,
  SMART_TREASURY_ADDRESS
} from '@/wallet/references/data';
import { FeeData, TransactionStatus, TransactionUnknown } from '@/wallet/types';
import { Transaction, TransactionTypes } from '@/wallet/types';

import { getMoverTransactionsTypes } from './../mover/transactions/service';
import { TransactionMoveTypeData } from './../mover/transactions/types';
import { isError } from './../responses';
import { ZerionTransaction, ZerionTransactionsReceived } from './responses';

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

// Temporary fix for zerion
const mapZerionoSymbol = (assetSymbol: string): string => {
  if (assetSymbol === 'HH') return 'MOVE';
  if (assetSymbol === 'mobo') return 'MOBO';
  return assetSymbol;
};

const feeMap = (fee: { value: number; price: number }): FeeData => ({
  feeInWEI: String(fee.value),
  ethPrice: String(fee.price)
});

export const isMoverTransation = (
  zt: ZerionTransaction,
  network: Network
): boolean => {
  if (
    isSubsidizedAddress(zt.address_from) ||
    isSubsidizedAddress(zt.address_to)
  ) {
    return true;
  }

  const HolyHandAddress = HOLY_HAND_ADDRESS(network);
  if (
    sameAddress(HolyHandAddress, zt.address_from) ||
    sameAddress(HolyHandAddress, zt.address_to)
  ) {
    return true;
  }

  const TreasuryAddress = SMART_TREASURY_ADDRESS(network);
  if (
    sameAddress(TreasuryAddress, zt.address_from) ||
    sameAddress(TreasuryAddress, zt.address_to)
  ) {
    return true;
  }

  if (
    zt.type === 'authorize' &&
    (sameAddress(TreasuryAddress, zt.meta.spender) ||
      sameAddress(HolyHandAddress, zt.meta.spender))
  ) {
    return true;
  }

  return false;
};

export const mapZerionTxns = async (
  data: ZerionTransactionsReceived,
  network: Network
): Promise<Array<Transaction>> => {
  try {
    let txns: Transaction[] = [];

    data.payload.transactions = data.payload.transactions.filter((t) =>
      isMoverTransation(t, network)
    );

    let moverTypesData: TransactionMoveTypeData[] = [];
    const moverTypesDataRes = await getMoverTransactionsTypes(
      data.payload.transactions.map((t) => t.hash)
    );
    if (isError<TransactionMoveTypeData[], string, void>(moverTypesDataRes)) {
      console.error(
        `Error from mover transaction service: ${moverTypesDataRes.error}`
      );
    } else {
      moverTypesData = moverTypesDataRes.result;
    }
    data.payload.transactions.forEach((t) => {
      const tradeTxns = parseTradeTransaction(t, moverTypesData);
      if (tradeTxns !== undefined) {
        txns = txns.concat(tradeTxns);
        return;
      }

      const receiveTxns = parseReceiveTransaction(t, moverTypesData);
      if (receiveTxns !== undefined) {
        txns = txns.concat(receiveTxns);
        return;
      }

      const sendTxns = parseSendTransaction(t, moverTypesData);
      if (sendTxns !== undefined) {
        txns = txns.concat(sendTxns);
        return;
      }

      const authTxns = parseAuthorizeTransaction(t, moverTypesData);
      if (authTxns !== undefined) {
        txns = txns.concat(authTxns);
        return;
      }

      const unknownTxns = tryToParseToUnknown(t, moverTypesData);
      if (unknownTxns !== undefined) {
        //txns = txns.concat(unknownTxns);
        console.log('Unknown txns:');
        console.log(unknownTxns);
        return;
      }
    });

    console.log('txns:', txns);
    return txns;
  } catch (e) {
    console.log('huy', e);
    Sentry.captureException(e);
    return [];
  }
};

const parseTradeTransaction = (
  tx: ZerionTransaction,
  moverTypeDate: TransactionMoveTypeData[]
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
              symbol: mapZerionoSymbol(c.asset.symbol),
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
            isOffchain: false,
            moverType:
              moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ??
              'unknown'
          };
        } else {
          return {
            asset: {
              address: c.asset.asset_code,
              decimals: c.asset.decimals,
              symbol: mapZerionoSymbol(c.asset.symbol),
              change: String(c.value),
              iconURL: c.asset.icon_url ?? '',
              price: String(c.price ?? '0'),
              direction: c.direction
            },
            blockNumber: String(tx.block_number),
            hash: tx.hash,
            uniqHash: `${tx.hash}-${ind}`,
            from: tx.address_from ?? '',
            nonce: String(tx.nonce),
            to: tx.address_to ?? '',
            timestamp: tx.mined_at,
            type: TransactionTypes.transferERC20,
            fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
            status: mapStatus(tx.status),
            isOffchain: false,
            moverType:
              moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ??
              'unknown'
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
          symbol: mapZerionoSymbol(c.asset.symbol),
          change: String(c.value),
          iconURL: c.asset.icon_url ?? '',
          price: String(c.price ?? '0'),
          direction: c.direction
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        from: tx.address_from ?? '',
        nonce: String(tx.nonce),
        to: tx.address_to ?? '',
        timestamp: tx.mined_at,
        type: TransactionTypes.transferERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false,
        moverType:
          moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
      }
    ];
  }
  return undefined;
};

const parseReceiveTransaction = (
  tx: ZerionTransaction,
  moverTypeDate: TransactionMoveTypeData[]
): Transaction[] | undefined => {
  if (tx.type === 'receive') {
    return tx.changes.map((c, ind) => ({
      asset: {
        address: c.asset.asset_code,
        decimals: c.asset.decimals,
        symbol: mapZerionoSymbol(c.asset.symbol),
        change: String(c.value),
        iconURL: c.asset.icon_url ?? '',
        price: String(c.price ?? '0'),
        direction: c.direction
      },
      blockNumber: String(tx.block_number),
      hash: tx.hash,
      uniqHash: `${tx.hash}-${ind}`,
      from: tx.address_from ?? '',
      nonce: String(tx.nonce),
      to: tx.address_to ?? '',
      timestamp: tx.mined_at,
      type: TransactionTypes.transferERC20,
      fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
      status: mapStatus(tx.status),
      isOffchain: false,
      moverType:
        moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
    }));
  }
  return undefined;
};

const parseAuthorizeTransaction = (
  tx: ZerionTransaction,
  moverTypeDate: TransactionMoveTypeData[]
): Transaction[] | undefined => {
  if (tx.type === 'authorize') {
    return [
      {
        asset: {
          address: tx.meta.asset.asset_code,
          decimals: tx.meta.asset.decimals,
          iconURL: tx.meta.asset.icon_url ?? '',
          symbol: mapZerionoSymbol(tx.meta.asset.symbol)
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        nonce: String(tx.nonce),
        timestamp: tx.mined_at,
        type: TransactionTypes.approvalERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false,
        moverType:
          moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
      }
    ];
  }
  return undefined;
};

const parseSendTransaction = (
  tx: ZerionTransaction,
  moverTypeDate: TransactionMoveTypeData[]
): Transaction[] | undefined => {
  if (tx.type === 'send' && tx.changes.length === 1) {
    const c = tx.changes[0];
    return [
      {
        asset: {
          address: c.asset.asset_code,
          decimals: c.asset.decimals,
          symbol: mapZerionoSymbol(c.asset.symbol),
          change: String(c.value),
          iconURL: c.asset.icon_url ?? '',
          price: String(c.price ?? '0'),
          direction: c.direction
        },
        blockNumber: String(tx.block_number),
        hash: tx.hash,
        uniqHash: `${tx.hash}-0`,
        from: tx.address_from ?? '',
        nonce: String(tx.nonce),
        to: tx.address_to ?? '',
        timestamp: tx.mined_at,
        type: TransactionTypes.transferERC20,
        fee: tx.fee ? feeMap(tx.fee) : { ethPrice: '0', feeInWEI: '0' },
        status: mapStatus(tx.status),
        isOffchain: false,
        moverType:
          moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
      }
    ];
  }
  return undefined;
};

const tryToParseToUnknown = (
  tx: ZerionTransaction,
  moverTypeDate: TransactionMoveTypeData[]
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
      isOffchain: false,
      moverType:
        moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
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
      isOffchain: false,
      moverType:
        moverTypeDate.find((t) => t.txID === tx.hash)?.moverTypes ?? 'unknown'
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
