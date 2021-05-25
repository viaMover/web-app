import axios from 'axios';
import { Result } from '../responses';

export type EthplorerToken = {
  tokenInfo: {
    address: string;
    name: string;
    decimals: string;
    symbol: string;
    price: {
      rate: string;
      currency: string;
    };
  };
  rawBalance: string;
};

type EthplorerAddressInfoResponse = {
  ETH: {
    price: {
      rate: string;
      ts: number;
    };
    rawBalance: string;
  };
  error: {
    code: number;
    message: string;
  };
  tokens: Array<EthplorerToken>;
};

type WalletInfo = {
  ETH: {
    price: {
      rate: string;
      ts: number;
    };
    rawBalance: string;
  };
  tokens: Array<EthplorerToken>;
};

const domain = 'https://api.ethplorer.io';
const apiKey = 'freekey';

export const GetWalletInfo = async (
  address: string
): Promise<Result<WalletInfo>> => {
  try {
    const response = (
      await axios.get<EthplorerAddressInfoResponse>(
        `${domain}/getAddressInfo/${address}?apiKey=${apiKey}`
      )
    ).data;
    if (response.error) {
      return {
        isError: true,
        result: {} as WalletInfo,
        errorMessage: response.error.message
      };
    }

    return { isError: false, result: response, errorMessage: '' };
  } catch (err) {
    return { isError: true, result: {} as WalletInfo, errorMessage: err };
  }
};
