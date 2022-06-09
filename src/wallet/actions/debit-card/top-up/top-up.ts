import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { getTransferData, TransferData } from '@/services/0x/api';
import { currentBalance } from '@/services/chain/erc20/balance';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import {
  convertStringToHexWithPrefix,
  getPureBaseAssetAddress
} from '@/utils/address';
import { fromWei, multiply, sub, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { executeTransactionWithApprove } from '@/wallet/actions/actionWithApprove';
import { unstake as unstakeDCULT } from '@/wallet/actions/debit-card/top-up/dCULT/top-up';
import { unstake as unstakeGALCX } from '@/wallet/actions/debit-card/top-up/gALCX/top-up';
import {
  getALCXAssetData,
  getBTRFLYAssetData,
  getCentralTransferProxyAbi,
  getCULTAssetData,
  getSlippage,
  getUSDCAssetData,
  lookupAddress
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { LoaderStep } from '@/components/forms/loader-form/types';

import { estimateTopUpCompound } from './top-up-estimate';
import { unwrap } from './wxBTRFLY/top-up';

export const topUpCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: (step: LoaderStep) => Promise<void>,
  actionGasLimit: string,
  approveGasLimit: string,
  unwrapGasLimit: string,
  gasPriceInGwei?: string
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');

  let topupInputAsset = inputAsset;
  let topupInputAmount = inputAmount;
  let topupTransferData = transferData;

  let topupActionGasLimit = actionGasLimit;
  let topupApproveGasLimit = approveGasLimit;

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS')
    )
  ) {
    try {
      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.topUpCompound',
        message: 'For wxBTRFLY we need to unwrap it',
        data: {
          inputAsset: inputAsset
        }
      });

      topupInputAsset = getBTRFLYAssetData(network);

      const balanceBeforeUnwrap = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      await unwrap(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress,
        changeStepToProcess,
        unwrapGasLimit,
        gasPriceInGwei
      );

      const balanceAfterUnwrap = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      const topupInputAmountInWei = sub(
        balanceAfterUnwrap,
        balanceBeforeUnwrap
      );
      topupInputAmount = fromWei(
        topupInputAmountInWei,
        topupInputAsset.decimals
      );
      topupTransferData = await getTransferData(
        getUSDCAssetData(network).address,
        topupInputAsset.address,
        topupInputAmountInWei,
        true,
        getSlippage(topupInputAsset.address, network),
        network
      );

      const resp = await estimateTopUpCompound(
        topupInputAsset,
        outputAsset,
        topupInputAmount,
        topupTransferData,
        network,
        web3,
        accountAddress
      );

      topupActionGasLimit = resp.actionGasLimit;
      topupApproveGasLimit = resp.approveGasLimit;
    } catch (err) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.unwrap',
        message: 'failed to unwrap for top up',
        data: {
          error: err
        }
      });
      throw err;
    }
  }

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'GALCX_TOKEN_ADDRESS')
    )
  ) {
    try {
      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.topUpCompound',
        message: 'Input asset is gALCX. Unstake is needed',
        data: {
          inputAsset: inputAsset
        }
      });

      topupInputAsset = getALCXAssetData(network);

      const balanceBeforeUnstake = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      await unstakeGALCX(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress,
        changeStepToProcess,
        unwrapGasLimit
      );

      const balanceAfterUnstake = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      const topupInputAmountInWei = sub(
        balanceAfterUnstake,
        balanceBeforeUnstake
      );
      topupInputAmount = fromWei(
        topupInputAmountInWei,
        topupInputAsset.decimals
      );
      topupTransferData = await getTransferData(
        getUSDCAssetData(network).address,
        topupInputAsset.address,
        topupInputAmountInWei,
        true,
        getSlippage(topupInputAsset.address, network),
        network
      );

      const resp = await estimateTopUpCompound(
        topupInputAsset,
        outputAsset,
        topupInputAmount,
        topupTransferData,
        network,
        web3,
        accountAddress
      );

      topupActionGasLimit = resp.actionGasLimit;
      topupApproveGasLimit = resp.approveGasLimit;
    } catch (err) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.unstake',
        message: 'Failed to unstake for top up',
        data: {
          error: err
        }
      });
      throw err;
    }
  }

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'DCULT_TOKEN_ADDRESS')
    )
  ) {
    try {
      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.topUpCompound',
        message: 'Input asset is dCULT. Unstake is needed',
        data: {
          inputAsset: inputAsset
        }
      });

      topupInputAsset = getCULTAssetData(network);

      const balanceBeforeUnstake = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      await unstakeDCULT(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress,
        changeStepToProcess,
        unwrapGasLimit
      );

      const balanceAfterUnstake = await currentBalance(
        web3,
        accountAddress,
        topupInputAsset.address
      );

      const topupInputAmountInWei = sub(
        balanceAfterUnstake,
        balanceBeforeUnstake
      );
      topupInputAmount = fromWei(
        topupInputAmountInWei,
        topupInputAsset.decimals
      );
      topupTransferData = await getTransferData(
        getUSDCAssetData(network).address,
        topupInputAsset.address,
        topupInputAmountInWei,
        true,
        getSlippage(topupInputAsset.address, network),
        network
      );

      const resp = await estimateTopUpCompound(
        topupInputAsset,
        outputAsset,
        topupInputAmount,
        topupTransferData,
        network,
        web3,
        accountAddress
      );

      topupActionGasLimit = resp.actionGasLimit;
      topupApproveGasLimit = resp.approveGasLimit;
    } catch (err) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.unstake',
        message: 'Failed to unstake for top up',
        data: {
          error: err
        }
      });
      throw err;
    }
  }

  changeStepToProcess('Confirm');

  try {
    await executeTransactionWithApprove(
      topupInputAsset,
      contractAddress,
      topupInputAmount,
      accountAddress,
      web3,
      async (newGasLimit) =>
        topUp(
          topupInputAsset,
          outputAsset,
          topupInputAmount,
          topupTransferData,
          network,
          web3,
          accountAddress,
          changeStepToProcess,
          newGasLimit,
          gasPriceInGwei
        ),
      () =>
        estimateTopUpCompound(
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          network,
          web3,
          accountAddress
        ),
      () => changeStepToProcess('Process'),
      topupApproveGasLimit,
      topupActionGasLimit,
      gasPriceInGwei
    );
  } catch (err) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.topUpCompound',
      message: 'failed to top up',
      data: {
        error: err
      }
    });
    throw err;
  }
};

export const topUp = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: (step: LoaderStep) => Promise<void>,
  gasLimit: string,
  gasPriceInGwei?: string
): Promise<void | never> => {
  if (
    !sameAddress(inputAsset.address, outputAsset.address) &&
    transferData === undefined
  ) {
    throw 'TransferData is missing';
  }

  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');
  const contractABI = getCentralTransferProxyAbi(network);

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
    value: value,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: gasPriceInGwei
      ? web3.utils.toWei(web3.utils.toBN(gasPriceInGwei), 'gwei').toString()
      : undefined,
    maxFeePerGas: gasPriceInGwei ? undefined : null,
    maxPriorityFeePerGas: gasPriceInGwei ? undefined : null
  } as TransactionsParams;

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'input amount in WEI',
    data: {
      inputAmountInWEI
    }
  });

  let bytesData: number[] = [];
  let expectedMinimumReceived = '0';

  if (transferData) {
    expectedMinimumReceived = new BigNumber(
      multiply(transferData.buyAmount, '0.85')
    ).toFixed(0);

    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUp',
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

    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUp',
      message: 'bytes',
      data: {
        valueBytes: Web3.utils.bytesToHex(valueBytes),
        dataBytes: Web3.utils.bytesToHex(bytesData)
      }
    });
  }

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'transaction params',
    data: {
      ...transactionParams
    }
  });

  let inputCurrencyAddress = inputAsset.address;
  if (inputAsset.address === 'eth') {
    inputCurrencyAddress = getPureBaseAssetAddress();
  }

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'currencies',
    data: {
      inputCurrencyAddress,
      outputCurrencyAddress: outputAsset.address
    }
  });

  await new Promise<void>((resolve, reject) => {
    (
      holyHand.methods.cardTopUp(
        accountAddress,
        inputCurrencyAddress,
        inputAmountInWEI,
        expectedMinimumReceived,
        bytesData
      ) as ContractSendMethod
    )
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.topUp',
          message: 'transaction hash',
          data: {
            hash
          }
        });

        console.log('debug debit card top up txn hash', hash);
        changeStepToProcess('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.topUp',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
        console.debug('debit card top up txn receipt', receipt);
        resolve();
      })
      .once('error', (error: Error) => reject(error));
  });
};
