import Web3 from 'web3';

import { TransferData } from '@/services/0x/api';
import store from '@/store/index';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import { createSavingsDepositActionString } from '@/wallet/actions/subsidized';
import {
  ACTION,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '@/wallet/actions/subsidized';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import { lookupAddress } from '@/wallet/references/data';
import { SmallToken, TransactionTypes } from '@/wallet/types';
import { Transaction } from '@/wallet/types';

export const depositSubsidized = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED savings deposit...');

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  const poolAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');

  const actionString = createSavingsDepositActionString(
    accountAddress,
    poolAddress,
    inputAsset.address,
    inputAmountInWEI
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SAVINGS_DEPOSIT,
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
        address: inputAsset.address,
        change: toWei(inputAmount, inputAsset.decimals),
        decimals: inputAsset.decimals,
        direction: 'out',
        iconURL: '',
        price: '0',
        symbol: inputAsset.symbol
      },
      from: accountAddress,
      to: holyHandAddress,
      subsidizedQueueId: subsidizedResponse.queueID,
      moverType: 'subsidized_deposit'
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
