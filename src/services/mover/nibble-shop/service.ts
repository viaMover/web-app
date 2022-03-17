import axios, { AxiosError } from 'axios';

import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';

import { Result } from '../../responses';
import { baseUrl } from '../consts';
import { ErrorResponse as MoverApiErrorResponse } from '../responses';
import {
  NibbleShopApiError,
  NibbleShopRedeemPayload,
  NibbleShopRedeemRequestPayload,
  NibbleShopRedeemResponsePayload
} from './types';

const nibbleShopApiClient = axios.create({
  baseURL: `${baseUrl}/v2/nft`,
  headers: {
    Accept: 'application/json'
  }
});

export const redeemNibbleShopNFT = async (
  data: NibbleShopRedeemPayload,
  urlCode: string,
  signature: string
): Promise<Result<void, string, void>> => {
  try {
    const response = (
      await nibbleShopApiClient.post<NibbleShopRedeemResponsePayload>(
        `/${urlCode}/redeem`,
        {
          data: data,
          sig: signature
        } as NibbleShopRedeemRequestPayload
      )
    ).data;

    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.error,
        shortError: response.errorCode
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    const formattedError = formatError<void>(error);
    if (formattedError instanceof NibbleShopApiError) {
      return {
        isError: true,
        error: formattedError.message,
        shortError: formattedError.shortMessage,
        payload: formattedError.additionalPayload
      };
    }

    throw formattedError;
  }
};

const formatError = <P = void>(error: unknown): Error => {
  const axiosError = error as AxiosError<MoverApiErrorResponse<P>>;
  if (axiosError.config !== undefined) {
    const requestUrl = `${axiosError.config?.baseURL}${axiosError.config?.url}`;
    const code = axiosError.code;

    addSentryBreadcrumb({
      message: 'A request to the Nibble shop is failed',
      data: {
        requestUrl,
        code
      }
    });
  }

  if (axiosError.response !== undefined) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (axiosError.response.data === undefined) {
      throw axiosError; // no data available
    }

    addSentryBreadcrumb({
      message: 'Nibble shop API responded with an error',
      data: {
        error: axiosError.response.data.error,
        shortError: axiosError.response.data.errorCode
      }
    });

    return new NibbleShopApiError(
      axiosError.response.data.error,
      axiosError.response.data.errorCode,
      axiosError.response.data.payload
    );
  } else if (axiosError.request !== undefined) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest
    throw new Error(`the request is failed, no response: ${axiosError}`);
  } else {
    // Something happened in setting up the request that triggered an Error
    // or result handling went wrong

    if (error instanceof Error) {
      // An error is JS-initiated error, just pass it through
      throw error;
    }

    if (typeof error === 'object') {
      throw new Error(
        `the request is failed during setup / result handling : ${JSON.stringify(
          error
        )}`
      );
    }

    return new Error(
      `request is failed during setup / result handling: ${error}`
    );
  }
};
