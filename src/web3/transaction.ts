import Web3 from 'web3';

export const getTransactionReceiptMined = (
  txHash: string,
  interval: number,
  web3: Web3
): Promise<unknown> => {
  const transactionReceiptAsyncFn = (
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  ) => {
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        console.info(`TX with hash: ${txHash} was rejected: ${error}`);
        reject(error);
      } else if (receipt == null) {
        console.info(`TX with hash: ${txHash} has no receipt yet...`);
        setTimeout(() => transactionReceiptAsyncFn(resolve, reject), interval);
      } else {
        console.info(`TX with hash: ${txHash} has receipt:`, receipt);
        resolve(receipt);
      }
    });
  };

  const transactionReceiptAsync = new Promise(transactionReceiptAsyncFn);
  return transactionReceiptAsync;
};
