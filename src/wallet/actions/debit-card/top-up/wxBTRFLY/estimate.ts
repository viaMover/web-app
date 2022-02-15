import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { EstimateResponse } from '@/wallet/actions/types';
import { lookupAddress, WX_BTRFLY_ABI } from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const estimateWXBTRFLYUnwrap = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  const contractAddress = lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS');
  const contractABI = WX_BTRFLY_ABI;

  try {
    const wxBtrflyContract = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateWxBtrflyUnwrap',
      message: 'input amount in WEI',
      data: {
        inputAmountInWEI
      }
    });

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateWxBtrflyUnwrap',
      message: 'transaction params',
      data: {
        ...transactionParams
      }
    });
    const gasLimitObj = await (
      wxBtrflyContract.methods.unwrapToBTRFLY(
        inputAmountInWEI
      ) as ContractSendMethod
    ).estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');

      Sentry.addBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateWxBtrflyUnwrap',
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
      category: 'debit-card.top-up.estimateWxBtrflyUnwrap',
      message: 'failed to estimate top up',
      data: {
        error
      }
    });
    console.error("can't estimate WxBtrflyUnwrap", error);

    return {
      error: true,
      gasLimit: '0'
    };
  }
};
