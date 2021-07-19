import { Network } from './../../utils/networkTypes';
import { zeroXResponse, zeroXErrorResponse, isErrorResponse } from './response';
import axios from 'axios';
import { CustomError } from 'ts-custom-error';
import { multiply } from '@/utils/bigmath';

export class ZeroXSwapError extends CustomError {
  public publicMessage: string;

  constructor(internalMessage: string, publicMessage?: string) {
    super(internalMessage);
    this.publicMessage = publicMessage ?? internalMessage;
  }
}
export type TransferData = {
  data: string;
  allowanceTarget: string;
  to: string;
  value: string;
  buyAmount: string;
  sellAmount: string;
  swappingVia: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
};

export const getTransferData = async (
  buyTokenAddress: string,
  sellTokenAddress: string,
  rawAmount: string,
  isInputAmount = true,
  slippage: string,
  network = Network.mainnet
): Promise<TransferData> => {
  const amountKey = isInputAmount ? 'sellAmount' : 'buyAmount';
  const prefix = network === Network.mainnet ? '' : `${network.toString()}.`;

  const slippageFromPercents = multiply(slippage, '0.01');

  const url = `https://${prefix}api.0x.org/swap/v1/quote?buyToken=${buyTokenAddress}&sellToken=${sellTokenAddress}&${amountKey}=${rawAmount}&slippagePercentage=${slippageFromPercents}`;

  console.info(url);

  try {
    const resp = (await axios.get<zeroXResponse | zeroXErrorResponse>(url))
      .data;

    console.info('response:', resp);

    if (isErrorResponse(resp)) {
      throw new Error(resp.reason);
    }

    const via = resp.sources.find((s) => s.proportion != '0') ?? { name: '' };

    return {
      allowanceTarget: resp.allowanceTarget,
      buyAmount: resp.buyAmount,
      data: resp.data,
      sellAmount: resp.sellAmount,
      to: resp.to,
      value: resp.value,
      swappingVia: via.name,
      buyTokenToEthRate: resp.buyTokenToEthRate,
      sellTokenToEthRate: resp.sellTokenToEthRate
    } as TransferData;
  } catch (err) {
    if (err && err.response && err.response.data) {
      if (
        err.response.data.reason === 'Validation Failed' &&
        err.response.data.validationErrors &&
        err.response.data.validationErrors.length > 0
      ) {
        throw new ZeroXSwapError(
          err.response.data,
          err.response.data.validationErrors[0].reason
        );
      }
    }
    throw new Error(err);
  }
};
