import { Network } from './../utils/networkTypes';
import { CheckSubsidizedInQueueTx, QUEUED_STATUS } from './actions/subsidized';
import { Transaction } from './types';
import store from '@/store/index';

export type OffchainExplorerHanler = ReturnType<typeof setTimeout>;

const REFRESH_OFFCHAIN_TRANSACTIONS_FREQUENCY = 10000; // 10 sec

export const initOffchainExplorer = (network: Network) => {
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
            } else if (subsResp.status === QUEUED_STATUS.DISCARDED) {
              needUpdate = true;
              console.log(
                `[offchainExplorer] Subsidized queued tx without hash (queueId: ${tx.subsidizedQueueId}), discarded!`
              );

              tx.status = 'failed';
            }
          } else {
            console.error(
              '[offchainExplorer] Empty response from `CheckSubsidizedInQueueTx`'
            );
          }
        }
      })
    );

    if (needUpdate) {
      console.log(
        `[offchainExplorer] Update the following txns:`,
        updatedPendingTransactions
      );
    }

    store.commit(
      'account/updateWalletTransactions',
      updatedPendingTransactions
    );

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

export const clearOffchainExplorer = () => {
  const offchainTransactionsHandle =
    store.getters['account/getOffchainExplorerHanlder'];
  if (offchainTransactionsHandle !== undefined) {
    clearTimeout(offchainTransactionsHandle);
  }
  store.commit('account/setOffchainExplorerHandler', undefined);
};
