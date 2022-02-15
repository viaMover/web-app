import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
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
  CompoundEstimateResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import { HOLY_HAND_ABI, lookupAddress } from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const estimateDepositCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');

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
    console.error(`Can't estimate approve:`, err);
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
        actionGasLimit: ethDefaults.basic_holy_savings_deposit,
        approveGasLimit: approveGasLimit
      };
    } catch (err) {
      console.error(`Can't estimate approve:`, err);
      return {
        error: true,
        actionGasLimit: '0',
        approveGasLimit: '0'
      };
    }
  } else {
    const depositEstimate = await estimateDeposit(
      inputAsset,
      outputAsset,
      inputAmount,
      transferData,
      network,
      web3,
      accountAddress
    );
    return {
      error: depositEstimate.error,
      approveGasLimit: '0',
      actionGasLimit: depositEstimate.gasLimit
    };
  }
};

export const estimateDeposit = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  console.log('Estimating savings deposit...');

  if (
    !sameAddress(inputAsset.address, outputAsset.address) &&
    transferData === undefined
  ) {
    throw 'We need transafer data for not USDC token';
  }

  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');
  const contractABI = HOLY_HAND_ABI;

  const poolAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');

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
      '[savings deposit estimation] input amount in WEI:',
      inputAmountInWEI
    );

    let bytesData = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      console.log(
        '[savings deposit estimation] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );
      console.log(
        '[savings deposit estimation] valueBytes:',
        Web3.utils.bytesToHex(valueBytes)
      );

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      console.log(
        '[savings deposit estimation] bytesData:',
        Web3.utils.bytesToHex(bytesData)
      );
    }

    console.log(
      '[savings deposit estimation] transactionParams:',
      transactionParams
    );

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log(
      '[savings deposit estimation] inputCurrencyAddress:',
      inputCurrencyAddress
    );
    console.log(
      '[savings deposit estimation] outputCurrencyAddress:',
      outputCurrencyAddress
    );

    const gasLimitObj = await holyHand.methods
      .depositToPool(
        poolAddress,
        inputCurrencyAddress,
        inputAmountInWEI,
        expectedMinimumReceived,
        bytesData
      )
      .estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[savings deposit estimation] gas estimation by web3: ' + gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[savings deposit estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate savings deposit due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
