import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

export const getTransactionReceiptMined = (
  txHash: string,
  interval: number,
  web3: Web3
): Promise<TransactionReceipt> => {
  const transactionReceiptAsyncFn = (
    resolve: (value: TransactionReceipt) => void,
    reject: (reason?: Error) => void
  ): void => {
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        reject(error);
      } else if (receipt == null) {
        setTimeout(() => transactionReceiptAsyncFn(resolve, reject), interval);
      } else {
        resolve(receipt);
      }
    });
  };

  return new Promise(transactionReceiptAsyncFn);
};
