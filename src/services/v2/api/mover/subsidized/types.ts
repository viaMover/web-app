export type TxExecuteRequest = {
  action: string;
  signature: string;
};

export type TxExecuteResponse = {
  timestampreceived: number;
  txID?: string;
  queueID?: string;
};

export type TxStatusResponse = {
  timestampreceived: number;
  txStatus: string;
  txStatusCode: TransactionStatus;
  txID?: string;
};

export type ExecuteTransactionReturn = {
  queueID?: string;
  txID?: string;
};

export type CheckTransactionStatusReturn =
  | {
      status: TransactionStatus.Queued;
    }
  | {
      status: TransactionStatus.Executing | TransactionStatus.Completed;
      txID: string;
    }
  | {
      status: TransactionStatus.Discarded;
      errorStatus: string;
    };

export enum TransactionStatus {
  Queued = 'QUEUED',
  Executing = 'EXECUTING',
  Completed = 'COMPLETED',
  Discarded = 'DISCARDED'
}
