import { Network } from '@/utils/networkTypes';

import { TransferData } from './types';

export interface ISwapper {
  getName(): string;

  getTransferData(
    buyTokenAddress: string,
    sellTokenAddress: string,
    rawAmount: string,
    isInputAmount: boolean,
    slippage: string
  ): Promise<TransferData>;

  canHandle(network: Network): boolean;
}
