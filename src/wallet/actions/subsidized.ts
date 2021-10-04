import axios from 'axios';
import { CustomError } from 'ts-custom-error';
import Web3 from 'web3';

import { greaterThan, greaterThanOrEqual } from '@/utils/bigmath';
import { fromWei, multiply } from '@/utils/bigmath';
import { getNetwork } from '@/utils/networkTypes';
import { Network } from '@/utils/networkTypes';

export class SubsidizedRequestError extends CustomError {
  public publicMessage: string;

  constructor(internalMessage: string, publicMessage?: string) {
    super(internalMessage);
    this.publicMessage = publicMessage ?? internalMessage;
  }
}

type SubsidizedRequest = {
  action: string;
  signature: string;
};

type SubsidizedResponse = {
  timestampreceived: number;
  status: string;
  error?: string;
  errorCode?: string;
  queueID?: string;
  txID?: string;
};

type CheckSubsidizedQueuedResponse = {
  timestampreceived: number;
  status: string;
  error?: string;
  errorCode?: string;
  txStatus?: string;
  txStatusCode?: string;
  txID?: string;
};

// API OBJECTS

type SubsidizedTxData = {
  queueID?: string;
  txID?: string;
  actionType: ACTION;
};

type CheckSubsidizedQueuedTxData = {
  status: QUEUED_STATUS; // if 'ok' we can go next, otherwise set status into tx
  errorStatus?: string; // set this status into tx result
  txID?: string;
};

export enum QUEUED_STATUS {
  OK = 'OK',
  DISCARDED = 'DISCARDED'
}

export enum ACTION {
  SEND = 'SEND',
  SWAP = 'SWAP',
  SAVINGS_DEPOSIT = 'SAVINGS_DEPOSIT',
  SAVINGS_WITHDRAW = 'SAVINGS_WITHDRAW'
}

export const createSendActionString = (
  accountAddress: string,
  to: string,
  tokenAddress: string,
  amount: string
): string => {
  const ts = Math.floor(Date.now() / 1000);
  return `ON BEHALF ${accountAddress} TIMESTAMP ${ts} EXECUTE SEND TO ${to} TOKEN ${tokenAddress} AMOUNT ${amount}`;
};

export const createSwapActionString = (
  accountAddress: string,
  tokenFromAddress: string,
  tokenToAddress: string,
  amount: string,
  expectedMinimum: string
): string => {
  const ts = Math.floor(Date.now() / 1000);
  return `ON BEHALF ${accountAddress} TIMESTAMP ${ts} EXECUTE SWAP TOKEN_FROM ${tokenFromAddress} TOKEN_TO ${tokenToAddress} AMOUNT_FROM ${amount} EXPECTED_MINIMUM ${expectedMinimum}`;
};

export const createSavingsDepositActionString = (
  accountAddress: string,
  poolAddress: string,
  tokenAddress: string,
  amount: string
): string => {
  const ts = Math.floor(Date.now() / 1000);
  return `ON BEHALF ${accountAddress} TIMESTAMP ${ts} EXECUTE DEPOSIT TOKEN ${tokenAddress} TO_DESTINATION ${poolAddress} AMOUNT ${amount}`;
};

export const createSavingsWithdrawActionString = (
  accountAddress: string,
  poolAddress: string,
  amount: string
): string => {
  const ts = Math.floor(Date.now() / 1000);
  return `ON BEHALF ${accountAddress} TIMESTAMP ${ts} EXECUTE WITHDRAW FROM ${poolAddress} AMOUNT_TOKEN ${amount}`;
};

export const sendSubsidizedRequest = async (
  actionType: ACTION,
  action: string,
  accountAddress: string,
  network: Network,
  web3: Web3,
  changeStepToProcess: () => Promise<void>
): Promise<SubsidizedTxData> => {
  // const t = 1;
  // if (t) {
  //   return {
  //     actionType,
  //     queueID: '1',
  //     txID: ''
  //   };
  // }

  const baseUrl = getNetwork(network)?.subsidizedUrl;
  if (baseUrl === undefined) {
    throw new Error(`network ${network} doesn't support subsidezed requests`);
  }

  console.log(`ActionType: ${actionType}`);
  console.log(`Message to sign: ${action}`);
  console.log(`Account address: ${accountAddress}`);

  const signature = await web3.eth.personal.sign(action, accountAddress, '');

  changeStepToProcess();

  const url = `${baseUrl}/tx/executeSubsidized`;

  try {
    console.log('Senging subsidizing request to ', url);
    const response = (
      await axios.post<SubsidizedResponse>(url, {
        action: action,
        signature: signature
      } as SubsidizedRequest)
    ).data;

    console.log('Response from subsidized service: ', response);

    if (response.status !== 'ok') {
      if (response.error !== undefined) {
        throw new SubsidizedRequestError(
          `Subsidized request error: ${response.error}`,
          response.error
        );
      } else {
        throw new SubsidizedRequestError('Subsidized service error');
      }
    }

    if (response.txID === undefined && response.queueID === undefined) {
      throw new SubsidizedRequestError(
        'Subsidized service sends wrong response'
      );
    }

    return {
      actionType,
      queueID: response.queueID,
      txID: response.txID
    };
  } catch (error) {
    throw new SubsidizedRequestError(
      `Failed to send subsidized request: ${error}`,
      'Failed to send subsidized request'
    );
  }
};

export const CheckSubsidizedInQueueTx = async (
  queueId: string,
  network: Network
): Promise<CheckSubsidizedQueuedTxData | undefined> => {
  const baseUrl = getNetwork(network)?.subsidizedUrl;
  if (baseUrl === undefined) {
    throw new Error(`network ${network} doesn't support subsidezed requests`);
  }

  const url = `${baseUrl}/tx/executeStatus/${queueId}`;

  try {
    const response = (await axios.get<CheckSubsidizedQueuedResponse>(url)).data;
    console.log(
      `Response from subsidized service about queue id: ${queueId}:`,
      response
    );

    if (response.status !== 'ok') {
      throw new Error(
        `Failed to check subsidized queued request. Error: ${response.error}, code: ${response.errorCode}, status: ${response.status}`
      );
    }

    if (response.txStatusCode === 'DISCARDED') {
      console.log(`Tx with queue id ${queueId} discarded!`);
      return {
        errorStatus: response.txStatus,
        status: QUEUED_STATUS.DISCARDED
      };
    }

    return;
  } catch (error) {
    throw new Error(
      `Failed to check subsidized request status (queueId: ${queueId}), alerted user. Error: ${error}`
    );
  }
};

export const calcTransactionFastNativePrice = (
  fastGasPriceGWEI: string,
  txGasLimit: string,
  ethPrice: string
): string => {
  console.log('gassless transaction mode available');
  console.log('fastGasPriceGWEI;', fastGasPriceGWEI);
  const fastGasPriceWEI = Web3.utils.toWei(fastGasPriceGWEI, 'Gwei');
  console.log('fastGasPriceWEI;', fastGasPriceWEI);

  console.log('gasLimit:', txGasLimit);

  const fastTransactionPriceWEI = multiply(txGasLimit, fastGasPriceWEI);
  console.log('fastTransactionPriceWEI:', fastTransactionPriceWEI);

  const fastTransactionPriceEth = fromWei(fastTransactionPriceWEI, '18');
  console.log('fastTransactionPriceEth:', fastTransactionPriceEth);

  console.log('ethPrice:', ethPrice);

  const fastTransactionPriceNative = multiply(
    fastTransactionPriceEth,
    ethPrice
  );
  return fastTransactionPriceNative;
};

export const isSubsidizedAllowed = (
  fastGasPriceGWEI: string,
  txGasLimit: string,
  ethPrice: string,
  treasuryBonus: string
): boolean => {
  console.log('treasuryBonus (native):', treasuryBonus);
  const fastTransactionPriceNative = calcTransactionFastNativePrice(
    fastGasPriceGWEI,
    txGasLimit,
    ethPrice
  );
  console.log('fastTransactionPriceNative:', fastTransactionPriceNative);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Subsidized allowed for DEV');
    return true;
  }

  const gasless =
    greaterThanOrEqual(treasuryBonus, fastTransactionPriceNative) &&
    greaterThan(treasuryBonus, '0');
  return gasless;
};

const subsAddresses = [
  '0x213793865Aca451B28fB15bf940b2b7E3aDd34a5'.toLowerCase(),
  '0x70Fb7f7840bD33635a7e33792F2bBeBDCde19889'.toLowerCase(),
  '0xdAc8619CD25a6FEDA197e354235c3bBA7d847b90'.toLowerCase()
];

export const isSubsidizedAddress = (from?: string | null): boolean => {
  if (!from) {
    return false;
  }
  return subsAddresses.includes(from);
};
