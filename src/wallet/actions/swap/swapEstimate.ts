import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import {
  convertStringToHexWithPrefix,
  getPureEthAddress
} from '@/utils/address';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  CompoundEstimateResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import { HOLY_HAND_ABI, HOLY_HAND_ADDRESS } from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { estimateApprove } from '../approve/approveEstimate';
import { needApprove } from '../approve/needApprove';

export const estimateSwapCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const contractAddress = HOLY_HAND_ADDRESS(network);

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
    console.error(`Can't estimate approve: `, err);
    return {
      error: true,
      approveGasLimit: '0',
      actionGasLimit: '0'
    };
  }

  if (isApproveNeeded) {
    console.log("Needs approve, can't do a proper estimation");
    try {
      const approveGasLimit = await estimateApprove(
        accountAddress,
        inputAsset.address,
        contractAddress,
        web3
      );
      // if (useSubsidized) {
      //   return {
      //     error: false,
      //     approveGasLimit: approveGasLimit,
      //     actionGasLimit: '0'
      //   };
      // }

      return {
        error: false,
        actionGasLimit: ethDefaults.basic_holy_swap,
        approveGasLimit: approveGasLimit
      };
    } catch (err) {
      console.error(`Can't estimate approve: `, err);
      return {
        error: true,
        actionGasLimit: '0',
        approveGasLimit: '0'
      };
    }
  } else {
    const swapEstimate = await estimateSwap(
      inputAsset,
      outputAsset,
      inputAmount,
      transferData,
      network,
      web3,
      accountAddress
    );
    return {
      error: swapEstimate.error,
      approveGasLimit: '0',
      actionGasLimit: swapEstimate.gasLimit
    };
  }
};

export const estimateSwap = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  console.log('Estimating swap...');

  const contractAddress = HOLY_HAND_ADDRESS(network);
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

    console.log('[swap estimation] input amount in WEI:', inputAmountInWEI);

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      console.log(
        '[swap estimation] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );
      console.log(
        '[swap estimation] valueBytes:',
        Web3.utils.bytesToHex(valueBytes)
      );

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      console.log(
        '[swap estimation] bytesData:',
        Web3.utils.bytesToHex(bytesData)
      );
    }

    console.log('[swap estimation] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log(
      '[swap estimation] inputCurrencyAddress:',
      inputCurrencyAddress
    );
    console.log(
      '[swap estimation] outputCurrencyAddress:',
      outputCurrencyAddress
    );

    const gasLimitObj = await holyHand.methods
      .executeSwap(
        inputCurrencyAddress,
        outputCurrencyAddress,
        inputAmountInWEI,
        expectedMinimumReceived,
        bytesData
      )
      .estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log('[swap estimation] gas estimation by web3: ' + gasLimit);
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[swap estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate swap due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
