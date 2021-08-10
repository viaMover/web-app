import { Transaction } from './../../../types';
import { currentTimestamp } from './../../../../utils/time';
import { createSavingsWithdrawActionString } from './../../subsidized';
import { toWei } from '@/utils/bigmath';
import store from '@/store/index';
import { Network } from '@/utils/networkTypes';
import { SmallToken, TransactionTypes } from '@/wallet/types';
import Web3 from 'web3';
import {
  ACTION,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '@/wallet/actions/subsidized';
import {
  HOLY_SAVINGS_POOL_ADDRESS,
  HOLY_HAND_ADDRESS
} from '@/wallet/references/data';

export const withdrawSubsidized = async (
  outputAsset: SmallToken,
  outputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED savings withdraw...');

  const outputAmountInWEI = toWei(outputAmount, outputAsset.decimals);

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const actionString = createSavingsWithdrawActionString(
    accountAddress,
    poolAddress,
    outputAmountInWEI
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SAVINGS_WITHDRAW,
      actionString,
      accountAddress,
      network,
      web3,
      changeStepToProcess
    );

    const holyHandAddress = HOLY_HAND_ADDRESS(network);

    const tx: Transaction = {
      blockNumber: '0',
      fee: {
        ethPrice: store.getters['account/ethPrice'],
        feeInWEI: '0'
      },
      hash: subsidizedResponse.txID ?? '',
      isOffchain: true,
      nonce: '0',
      status: 'pending',
      timestamp: currentTimestamp(),
      type: TransactionTypes.transferERC20,
      uniqHash: subsidizedResponse.txID ? `${subsidizedResponse.txID}-0` : '',
      asset: {
        address: outputAsset.address,
        change: outputAmount,
        decimals: outputAsset.decimals,
        direction: 'in',
        iconURL: '',
        price: '0',
        symbol: outputAsset.symbol
      },
      from: holyHandAddress,
      to: accountAddress,
      subsidizedQueueId: subsidizedResponse.queueID
    };
    await store.dispatch('account/addTransaction', tx);
  } catch (err) {
    if (err instanceof SubsidizedRequestError) {
      console.error(`Subsidized request error: ${err.message}`);
    }
  }
};
