import { PromiEvent } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';

/**
 * An abstract class representing basic needs of every on-chain service
 */
export abstract class PromiEventWrapper {
  // sentry category prefix (used for `addSentryBreadcrumb({ category: ... })`
  protected abstract readonly sentryCategoryPrefix: string;

  /**
   * Wraps the call with the default `PromiEvent` chain handles: `transactionHash`, `receipt`, `error`.
   * Logs service/developer messages to the `console` and `Sentry`
   * @param promiEvent An event with optional chain of `.on(...)` and `.once(...)` handles
   * @param resolve A resolver of transaction call / `new Promise((resolve, reject) => {...})`
   * @param reject A rejecter of transaction call / `new Promise((resolve, reject) => {...})`
   * @param onTransactionHash A callback of successful transaction handling
   * @param breadcrumbPayload `addSentryBreadcrumb({data: ...})` payload
   * @protected
   */
  protected wrapWithSendMethodCallbacks<P>(
    promiEvent: PromiEvent<P>,
    resolve: (receipt: TransactionReceipt) => void,
    reject: (error: Error) => void,
    onTransactionHash?: (hash: string) => void,
    breadcrumbPayload?: Record<string, unknown>
  ): PromiEvent<P> {
    return promiEvent
      .once('transactionHash', (hash: string) => {
        addSentryBreadcrumb({
          type: 'debug',
          message: 'Received a transaction hash',
          data: {
            hash
          }
        });
        onTransactionHash?.(hash);
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        addSentryBreadcrumb({
          type: 'debug',
          message: 'Received a transaction receipt',
          data: {
            receipt
          }
        });
        resolve(receipt);
      })
      .once('confirmation', (confirmationNumber, receipt, latestBlockHash) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: this.sentryCategoryPrefix,
          message: 'Transaction is confirmed',
          data: {
            confirmationNumber,
            receipt,
            latestBlockHash
          }
        });
      })
      .once('error', (error) => {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'On-chain call failed',
          data: {
            ...breadcrumbPayload,
            error: error
          }
        });

        reject(error);
      });
  }
}
