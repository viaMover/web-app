import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import {
  convertStringToHexWithPrefix,
  getPureBaseAssetAddress
} from '@/utils/address';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { estimateApprove } from '@/wallet/actions/approve/approveEstimate';
import { needApprove } from '@/wallet/actions/approve/needApprove';
import { estimateDCULTUnstake } from '@/wallet/actions/debit-card/top-up/dCULT/estimate';
import { estimateGALCXUnstake } from '@/wallet/actions/debit-card/top-up/gALCX/estimate';
import { estimateWXBTRFLYUnwrap } from '@/wallet/actions/debit-card/top-up/wxBTRFLY/estimate';
import { estimateYearnSimpleUnwrap } from '@/wallet/actions/debit-card/top-up/yearn/estimate';
import {
  CompoundEstimateWithUnwrapResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import {
  getCentralTransferProxyAbi,
  isSimpleYearnVault,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, TransactionsParams } from '@/wallet/types';

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

  if (isSimpleYearnVault(inputAsset.address, network)) {
    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: 'For simple yearn vault we need to unwrap it',
      data: {
        inputAsset: inputAsset
      }
    });

    let estimation;
    try {
      estimation = await estimateYearnSimpleUnwrap(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'failed to estimate unwrap',
        data: {
          error
        }
      });

      throw new OnChainServiceError('Failed to estimate top up').wrap(error);
    }

    return {
      error: false,
      actionGasLimit: ethDefaults.basic_move_card_top_up,
      approveGasLimit: ethDefaults.basic_approval,
      unwrapGasLimit: estimation.gasLimit
    };
  }

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS')
    )
  ) {
    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: 'For wxBTRFLY we need to unwrap it',
      data: {
        inputAsset: inputAsset
      }
    });

    let estimation;
    try {
      estimation = await estimateWXBTRFLYUnwrap(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'failed to estimate unwrap',
        data: {
          error
        }
      });

      throw new OnChainServiceError('Failed to estimate top up').wrap(error);
    }

    return {
      error: false,
      actionGasLimit: ethDefaults.basic_move_card_top_up,
      approveGasLimit: ethDefaults.basic_approval,
      unwrapGasLimit: estimation.gasLimit
    };
  }

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'GALCX_TOKEN_ADDRESS')
    )
  ) {
    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUpCompound',
      message: 'Input asset is gALCX. Unstake is needed',
      data: {
        inputAsset: inputAsset
      }
    });

    let estimation;
    try {
      estimation = await estimateGALCXUnstake(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'failed to estimate unstake',
        data: {
          error
        }
      });

      throw new OnChainServiceError('Failed to estimate top up').wrap(error);
    }

    return {
      error: false,
      actionGasLimit: ethDefaults.basic_move_card_top_up,
      approveGasLimit: ethDefaults.basic_approval,
      unwrapGasLimit: estimation.gasLimit
    };
  }

  if (
    sameAddress(
      inputAsset.address,
      lookupAddress(network, 'DCULT_TOKEN_ADDRESS')
    )
  ) {
    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUpCompound',
      message: 'Input asset is dCULT. Unstake is needed',
      data: {
        inputAsset: inputAsset
      }
    });

    let estimation;
    try {
      estimation = await estimateDCULTUnstake(
        inputAsset,
        inputAmount,
        network,
        web3,
        accountAddress
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'failed to estimate unstake',
        data: {
          error
        }
      });

      throw new OnChainServiceError('Failed to estimate top up').wrap(error);
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
    addSentryBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.estimateTopUpCompound',
      message: 'failed to estimate approve',
      data: {
        error: err
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate top up: failed "needApprove" check'
    ).wrap(err);
  }

  if (isApproveNeeded) {
    addSentryBreadcrumb({
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
      addSentryBreadcrumb({
        type: 'error',
        category: 'debit-card.top-up.estimateTopUpCompound',
        message: 'Failed to estimate approve',
        data: {
          error
        }
      });

      throw new OnChainServiceError(
        'Failed to estimate top up: failed "estimateApprove"'
      ).wrap(error);
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
  const contractABI = getCentralTransferProxyAbi(network);

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

    addSentryBreadcrumb({
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

      addSentryBreadcrumb({
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

      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateTopUp',
        message: 'bytes',
        data: {
          valueBytes: Web3.utils.bytesToHex(valueBytes),
          dataBytes: Web3.utils.bytesToHex(bytesData)
        }
      });
    }

    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateTopUp',
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

      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateTopUp',
        message: 'gas estimations',
        data: {
          gasLimit,
          gasLimitWithBuffer
        }
      });

      return { error: false, gasLimit: gasLimitWithBuffer };
    }
  } catch (error) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.estimateTopUp',
      message: 'failed to estimate top up',
      data: {
        error
      }
    });

    throw new OnChainServiceError('Failed to estimate top up').wrap(error);
  }

  throw new OnChainServiceError('Failed to estimate top up: empty gas limit');
};
