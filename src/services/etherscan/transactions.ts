import axios from 'axios';
import { Result } from '../responses';

export type EtherscanTransaction = {
  blockNumber: string;
  hash: string;
  timeStamp: string;
  nonce: string;
  from: string;
  to: string;
  value: string;
};

type EtherScanResponse = {
  status: string;
  message: string;
  result: Array<EtherscanTransaction>;
};

export const GetTransactions = async (
  address: string
): Promise<Result<Array<EtherscanTransaction>>> => {
  try {
    const response = (
      await axios.get<EtherScanResponse>(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`
      )
    ).data;
    if (response.status !== '1') {
      return { isError: true, result: [], errorMessage: response.message };
    }

    return { isError: false, result: response.result, errorMessage: '' };
  } catch (err) {
    return { isError: true, result: [], errorMessage: err };
  }
};
