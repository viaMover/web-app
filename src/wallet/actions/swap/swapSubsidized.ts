import { waitOffchainTransactionReceipt } from './../../offchainExplorer';
import store from '@/store/index';
import { currentTimestamp } from './../../../utils/time';
import { Transaction } from './../../types';
import { BigNumber } from 'bignumber.js';
import { multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { SmallToken, TransactionTypes } from '@/wallet/types';
import { TransferData } from '@/services/0x/api';
import Web3 from 'web3';
import {
  ACTION,
  createSwapActionString,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '../subsidized';

export const swapSubsidized = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED swap...');

  const expectedMinimumReceived = new BigNumber(
    multiply(transferData.buyAmount, '0.85')
  ).toFixed(0);

  console.log(
    '[subsidized swap] expected minimum received:',
    expectedMinimumReceived
  );

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  const actionString = createSwapActionString(
    accountAddress,
    inputAsset.address,
    outputAsset.address,
    inputAmountInWEI,
    expectedMinimumReceived
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SWAP,
      actionString,
      accountAddress,
      network,
      web3,
      changeStepToProcess
    );

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
      type: TransactionTypes.swapERC20,
      uniqHash: subsidizedResponse.txID ? `${subsidizedResponse.txID}-0` : '',
      asset: {
        address: inputAsset.address,
        change: inputAmount,
        decimals: inputAsset.decimals,
        direction: 'out',
        iconURL: '',
        price: '0',
        symbol: inputAsset.symbol
      },
      subsidizedQueueId: subsidizedResponse.queueID
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
    console.error(`Common error: ${err}`);
  }
};
