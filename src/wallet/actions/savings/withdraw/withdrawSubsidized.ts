import Web3 from 'web3';

import store from '@/store/index';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import {
  ACTION,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '@/wallet/actions/subsidized';
import { createSavingsWithdrawActionString } from '@/wallet/actions/subsidized';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import { lookupAddress } from '@/wallet/references/data';
import { SmallToken, TransactionTypes } from '@/wallet/types';
import { Transaction } from '@/wallet/types';

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

  const poolAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');

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

    const holyHandAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');

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
        change: toWei(outputAmount, outputAsset.decimals),
        decimals: outputAsset.decimals,
        direction: 'in',
        iconURL: '',
        price: '0',
        symbol: outputAsset.symbol
      },
      from: holyHandAddress,
      to: accountAddress,
      subsidizedQueueId: subsidizedResponse.queueID,
      moverType: 'subsidized_withdraw'
    };
    await store.dispatch('account/addTransaction', tx);

    await waitOffchainTransactionReceipt(
      subsidizedResponse.queueID,
      subsidizedResponse.txID,
      web3
    );
  } catch (err) {
    if (err instanceof SubsidizedRequestError) {
      console.error(`Subsidized request error: ${err.message}`);
    }
    throw err;
  }
};
