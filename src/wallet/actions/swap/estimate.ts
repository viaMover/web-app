import { estimateApprove, needApprove } from './../approve/needApprove';
import { toWei, floorDivide, add } from '@/utils/bigmath';
import { SmallTokenInfo, TransactionsParams } from '@/wallet/types';
import { provider } from 'web3-core';
import { Network } from '@/utils/networkTypes';
import { networks } from '@/utils/networkTypes';
import { BigNumber } from 'bignumber.js';
import {
  getPureEthAddress,
  convertStringToHexWithPrefix
} from '@/utils/address';
import { TransferData } from '@/services/0x/api';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { multiply } from '@/utils/bigmath';
import { HOLY_HAND_ABI, HOLY_HAND_ADDRESS } from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};

export const estimateSwapCompound = async (
  inputAsset: SmallTokenInfo,
  outputAsset: SmallTokenInfo,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
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
    console.error(`Can't estimate approve: ${err}`);
    return {
      error: true,
      gasLimit: '0'
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
      const fullGasLimit = add(approveGasLimit, ethDefaults.basic_holy_swap);
      return {
        error: false,
        gasLimit: fullGasLimit
      };
    } catch (err) {
      console.error(`Can't estimate approve: ${err}`);
      return {
        error: true,
        gasLimit: '0'
      };
    }
  } else {
    return await estimateSwap(
      inputAsset,
      outputAsset,
      inputAmount,
      transferData,
      network,
      web3,
      accountAddress
    );
  }
};

export const estimateSwap = async (
  inputAsset: SmallTokenInfo,
  outputAsset: SmallTokenInfo,
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

    console.log(
      '[holy swap estimation] input amount in WEI:',
      inputAmountInWEI
    );

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      console.log(
        '[holy swap estimation] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );
      console.log(
        '[holy swap estimation] valueBytes:',
        Web3.utils.bytesToHex(valueBytes)
      );

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      console.log(
        '[holy swap estimation] bytesData:',
        Web3.utils.bytesToHex(bytesData)
      );
    }

    console.log('[holy swap estimation] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log(
      '[holy swap estimation] inputCurrencyAddress:',
      inputCurrencyAddress
    );
    console.log(
      '[holy swap estimation] outputCurrencyAddress:',
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
      console.log('[holy swap estimation] gas estimation by web3: ' + gasLimit);
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[holy swap estimation] gas estimation by web3 (with additional 20% as buffer): ' +
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
