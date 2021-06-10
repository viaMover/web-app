import { isError } from './../responses';
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
import { EtherScanResponse } from './response';

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

export const GetTransactions = async (
  address: string,
  network: Network
): Promise<Result<Array<Transaction>, string>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return {
      isError: true,
      error: `can't get ethescan api endpoint for '${network}'`
    };
  }

  const transfersRes = await GetERC20Transfers(address, endpoint);
  if (isError(transfersRes)) {
    return {
      isError: true,
      error: transfersRes.error
    };
  }

  await asyncSleep(5000);

  const transactionsRes = await GetCommonTransactions(address, endpoint);
  if (isError(transactionsRes)) {
    return {
      isError: true,
      error: transactionsRes.error
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

  return { isError: false, result: transactions };
};

const GetERC20Transfers = async (
  address: string,
  endpoint: string
): Promise<Result<Array<EtherscanTokenTransaction>, string>> => {
  try {
    const response = (
      await axios.get<EtherScanResponse<Array<EtherscanTokenTransaction>>>(
        `${endpoint}/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc`
      )
    ).data;
    if (response.status !== '1') {
      return { isError: true, error: response.message };
    }

    return { isError: false, result: response.result };
  } catch (err) {
    return { isError: true, error: err };
  }
};

const GetCommonTransactions = async (
  address: string,
  endpoint: string
): Promise<Result<Array<EtherscanTransaction>, string>> => {
  try {
    const response = (
      await axios.get<EtherScanResponse<Array<EtherscanTransaction>>>(
        `${endpoint}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`
      )
    ).data;
    if (response.status !== '1') {
      return { isError: true, error: response.message };
    }

    return { isError: false, result: response.result };
  } catch (err) {
    return { isError: true, error: err };
  }
};
