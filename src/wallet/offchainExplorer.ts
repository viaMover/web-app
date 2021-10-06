import { getTransactionReceiptMined } from '@/web3/transaction';
import { Network } from '@/utils/networkTypes';
import { CheckSubsidizedInQueueTx, QUEUED_STATUS } from './actions/subsidized';
import { Transaction } from './types';
import store from '@/store/index';
import Web3 from 'web3';

export type OffchainExplorerHanler = ReturnType<typeof setTimeout>;

const REFRESH_OFFCHAIN_TRANSACTIONS_FREQUENCY = 10000; // 10 sec
const REFRESH_OFFCHAIN_RECEIPT_TIMEOUT = 10000;

export const initOffchainExplorer = (network: Network): void => {
  const refreshOffchainTxns = async () => {
    console.log('[offchainExplorer] Refreshing offchain txns...');

    const pendingTxns = store.getters['account/getPendingOffchainTransactions'];

    console.log('[offchainExplorer] Offchain pending subsidized transactions:');
    console.log(pendingTxns);

    if (pendingTxns.length === 0) {
      console.log(
        '[[offchainExplorer]] No offchain pending subsidized transactions.'
      );
      const offchainTransactionsHandle = setTimeout(
        refreshOffchainTxns,
        REFRESH_OFFCHAIN_TRANSACTIONS_FREQUENCY
      );
      store.commit(
        'account/setOffchainExplorerHandler',
        offchainTransactionsHandle
      );
      return;
    }

    let needUpdate = false;
    const updatedPendingTransactions = await Promise.all(
      pendingTxns.map(async (tx: Transaction) => {
        if (tx.subsidizedQueueId !== undefined) {
          console.log(
            '[offchainExplorer] Checking pending subsidized tx without hash, with queueID: ',
            tx.subsidizedQueueId
          );
          try {
            const subsResp = await CheckSubsidizedInQueueTx(
              tx.subsidizedQueueId,
              network
            );
            if (subsResp) {
              if (subsResp.status === QUEUED_STATUS.OK && subsResp.txID) {
                needUpdate = true;
                console.log(
                  `[offchainExplorer] Subsidized queued tx without hash (queueId: ${tx.subsidizedQueueId}), completed and now has the hash: `,
                  subsResp.txID
                );
                tx.hash = `${subsResp.txID}-0`;
                tx.isOffchain = false;
                tx.subsidizedQueueId = undefined;
              } else if (subsResp.status === QUEUED_STATUS.DISCARDED) {
                needUpdate = true;
                console.log(
                  `[offchainExplorer] Subsidized queued tx without hash (queueId: ${tx.subsidizedQueueId}), discarded!`
                );

                tx.status = 'failed';
                tx.subsidizedQueueId = undefined;
              }
            } else {
              throw new Error('Empty response');
            }
          } catch (err) {
            console.error(
              `[offchainExplorer] Error response from 'CheckSubsidizedInQueueTx': ${err}`
            );
          }
        }
      })
    );

    if (needUpdate && updatedPendingTransactions.length > 0) {
      console.log(
        `[offchainExplorer] Update the following txns:`,
        updatedPendingTransactions
      );
      store.commit(
        'account/updateWalletTransactions',
        updatedPendingTransactions
      );
    }

    const offchainTransactionsHandle = setTimeout(
      refreshOffchainTxns,
      REFRESH_OFFCHAIN_TRANSACTIONS_FREQUENCY
    );
    store.commit(
      'account/setOffchainExplorerHandler',
      offchainTransactionsHandle
    );
  };

  refreshOffchainTxns();
};

export const clearOffchainExplorer = (): void => {
  const offchainTransactionsHandle =
    store.getters['account/getOffchainExplorerHanlder'];
  if (offchainTransactionsHandle !== undefined) {
    clearTimeout(offchainTransactionsHandle);
  }
  store.commit('account/setOffchainExplorerHandler', undefined);
};

export const waitOffchainTransactionReceipt = (
  queueId: string | undefined,
  hash: string | undefined,
  web3: Web3
): Promise<unknown> => {
  if (hash !== undefined) {
    return getTransactionReceiptMined(
      hash,
      REFRESH_OFFCHAIN_RECEIPT_TIMEOUT,
      web3
    );
  }
  return new Promise<void>((resolve, reject) => {
    const checkTxStatus = async () => {
      const tx: Transaction =
        store.getters['account/getTransactionByQueueId'](queueId);
      if (tx != undefined && tx.subsidizedQueueId === undefined) {
        if (tx.status === 'confirmed' && tx.hash) {
          try {
            await getTransactionReceiptMined(
              tx.hash,
              REFRESH_OFFCHAIN_RECEIPT_TIMEOUT,
              web3
            );
          } catch {
            reject();
          }
          resolve();
        } else if (tx.status === 'failed') {
          reject();
        }
      }
      setTimeout(checkTxStatus, REFRESH_OFFCHAIN_RECEIPT_TIMEOUT);
    };
    checkTxStatus();
  });
};
