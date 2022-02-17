import * as Sentry from '@sentry/vue';
import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import { sameAddress } from '@/utils/address';
import {
  convertStringToHexWithPrefix,
  getPureEthAddress
} from '@/utils/address';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { estimateApprove } from '@/wallet/actions/approve/approveEstimate';
import { needApprove } from '@/wallet/actions/approve/needApprove';
import {
  CompoundEstimateWithUnwrapResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import { HOLY_HAND_ABI, lookupAddress } from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { estimateWXBTRFLYUnwrap } from './wxBTRFLY/estimate';

export const estimateTopUpCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateWithUnwrapResponse> => {
  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS')
    )
  ) {
    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: 'For wxBTRFLY we need to unwrap it',
      data: {
        inputAsset: inputAsset
      }
    });
    const estimation = await estimateWXBTRFLYUnwrap(
      inputAsset,
      inputAmount,
      network,
      web3,
      accountAddress
    );
    if (estimation.error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'failed to estimate unwrap'
      });
      console.error("can't estimate unwrap");
      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0',
        unwrapGasLimit: '0'
      };
    }

    return {
      error: false,
      actionGasLimit: ethDefaults.basic_move_card_top_up,
      approveGasLimit: ethDefaults.basic_approval,
      unwrapGasLimit: estimation.gasLimit
    };
  }

  let isApproveNeeded = true;
  try {
    isApproveNeeded = await needApprove(
      accountAddress,
      inputAsset,
      inputAmount,
      contractAddress,
      web3
    );
  } catch (err) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: 'failed to estimate approve',
      data: {
        error: err
      }
    });
    console.error("can't estimate approve", err);
    return {
      error: true,
      approveGasLimit: '0',
      actionGasLimit: '0',
      unwrapGasLimit: '0'
    };
  }

  if (isApproveNeeded) {
    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: "Needs approve, can't do a proper estimation"
    });

    try {
      const approveGasLimit = await estimateApprove(
        accountAddress,
        inputAsset.address,
        contractAddress,
        web3
      );

      return {
        error: false,
        actionGasLimit: ethDefaults.basic_move_card_top_up,
        approveGasLimit: approveGasLimit,
        unwrapGasLimit: '0'
      };
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'Failed to estimate approve',
        data: {
          error
        }
      });

      console.error("can't estimate approve", error);
      return {
        error: true,
        actionGasLimit: '0',
        approveGasLimit: '0',
        unwrapGasLimit: '0'
      };
    }
  } else {
    const estimation = await estimateTopUp(
      inputAsset,
      outputAsset,
      inputAmount,
      transferData,
      network,
      web3,
      accountAddress
    );
    return {
      error: estimation.error,
      approveGasLimit: '0',
      actionGasLimit: estimation.gasLimit,
      unwrapGasLimit: '0'
    };
  }
};

export const estimateTopUp = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  if (
    !sameAddress(inputAsset.address, outputAsset.address) &&
    transferData === undefined
  ) {
    throw 'TransferData is missing';
  }

  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    let value = undefined;

    if (transferData) {
      value = Web3.utils.toHex(transferData.value);
    }

    const transactionParams = {
      from: accountAddress,
      value: value
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUp',
      message: 'input amount in WEI',
      data: {
        inputAmountInWEI
      }
    });

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      Sentry.addBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateTopUp',
        message: 'expected minimum received',
        data: {
          expectedMinimumReceived
        }
      });

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      Sentry.addBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateTopUp',
        message: 'bytes',
        data: {
          valueBytes: Web3.utils.bytesToHex(valueBytes),
          dataBytes: Web3.utils.bytesToHex(bytesData)
        }
      });
    }

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUp',
      message: 'transaction params',
      data: {
        ...transactionParams
      }
    });

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUp',
      message: 'currencies',
      data: {
        inputCurrencyAddress,
        outputCurrencyAddress: outputAsset.address
      }
    });

    const gasLimitObj = await (
      holyHand.methods.cardTopUp(
        accountAddress,
        inputCurrencyAddress,
        inputAmountInWEI,
        expectedMinimumReceived,
        bytesData
      ) as ContractSendMethod
    ).estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');

      Sentry.addBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateTopUp',
        message: 'gas estimations',
        data: {
          gasLimit,
          gasLimitWithBuffer
        }
      });

      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.estimateTopUp',
      message: 'failed to estimate top up',
      data: {
        error
      }
    });
    console.error("can't estimate top up", error);

    return {
      error: true,
      gasLimit: '0'
    };
  }
};
