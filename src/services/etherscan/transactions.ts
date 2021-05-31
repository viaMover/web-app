import { BigNumber } from 'bignumber.js';
import { sameAddress } from './../../utils/address';
import {
  Transaction,
  TransactionTypes
} from './../../store/modules/account/types';
import { Network } from '@/utils/networkTypes';
import axios from 'axios';
import { Result } from '../responses';
import { apiEndpoints } from './endpoints';
import { asyncSleep } from '@/utils/time';

type EtherscanTransaction = {
  blockNumber: string;
  hash: string;
  timeStamp: string;
  nonce: string;
  from: string;
  to: string;
  value: string;
};

type EtherscanTokenTransaction = {
  blockNumber: string;
  hash: string;
  timeStamp: string;
  nonce: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
};

type EtherScanResponse<T> = {
  status: string;
  message: string;
  result: Array<T>;
};

export const GetTransactions = async (
  address: string,
  network: Network
): Promise<Result<Array<Transaction>>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return {
      isError: true,
      result: [],
      errorMessage: `can't get ethescan api endpoint for '${network}'`
    };
  }

  const transfersRes = await GetERC20Transfers(address, endpoint);
  if (transfersRes.isError || transfersRes.result === undefined) {
    return {
      isError: true,
      result: [],
      errorMessage: transfersRes.errorMessage
    };
  }

  await asyncSleep(5000);

  const transactionsRes = await GetCommonTransactions(address, endpoint);
  if (transactionsRes.isError || transactionsRes.result === undefined) {
    return {
      isError: true,
      result: [],
      errorMessage: transactionsRes.errorMessage
    };
  }

  const transactions = new Array<Transaction>();

  transfersRes.result.forEach((t) => {
    transactions.push({
      blockNumber: t.blockNumber,
      hash: t.hash,
      timeStamp: parseInt(t.timeStamp),
      nonce: t.nonce,
      from: t.from,
      to: t.to,
      value: t.value,
      symbol: t.tokenSymbol,
      type: sameAddress(t.to, address)
        ? TransactionTypes.receiveERC20
        : TransactionTypes.sendERC20
    });
  });

  transactionsRes.result.forEach((t) => {
    if (transactions.find((et) => et.hash === t.hash) === undefined) {
      if (new BigNumber(t.value).gt('0')) {
        transactions.push({
          blockNumber: t.blockNumber,
          hash: t.hash,
          timeStamp: parseInt(t.timeStamp),
          nonce: t.nonce,
          from: t.from,
          to: t.to,
          value: t.value,
          symbol: 'ETH',
          type: sameAddress(t.to, address)
            ? TransactionTypes.receiveEth
            : TransactionTypes.sendERC20
        });
      }
    }
  });

  return { isError: false, result: transactions, errorMessage: '' };
};

const GetERC20Transfers = async (
  address: string,
  endpoint: string
): Promise<Result<Array<EtherscanTokenTransaction>>> => {
  try {
    const response = (
      await axios.get<EtherScanResponse<EtherscanTokenTransaction>>(
        `${endpoint}/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc`
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

const GetCommonTransactions = async (
  address: string,
  endpoint: string
): Promise<Result<Array<EtherscanTransaction>>> => {
  try {
    const response = (
      await axios.get<EtherScanResponse<EtherscanTransaction>>(
        `${endpoint}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`
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
