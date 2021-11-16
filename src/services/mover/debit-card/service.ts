import axios, { AxiosError } from 'axios';

import { Result } from '../../responses';
import { baseUrl } from '../consts';
import { ErrorResponse as MoverApiErrorResponse } from '../responses';
import {
  CardAggregatedInfo,
  CardInfoRequestPayload,
  CardInfoResponsePayload,
  ChangePhoneNumberRequestPayload,
  ChangePhoneNumberResponsePayload,
  DebitCardApiError,
  OrderCardPayload,
  OrderCardRequestPayload,
  OrderCardResponsePayload,
  ValidatePhoneNumberRequestPayload,
  ValidatePhoneNumberResponsePayload
} from './types';

const cardApiClient = axios.create({
  baseURL: `${baseUrl}/card`,
  headers: {
    Accept: 'application/json'
  }
});

const fetchInfo = async (
  accountAddress: string,
  email: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<CardAggregatedInfo, string>> => {
  try {
    const response = (
      await cardApiClient.post<CardInfoResponsePayload>('/hash', {
        data: {
          email
        },
        meta: {
          hash: emailHash,
          address: accountAddress,
          sig: emailSignature
        }
      } as CardInfoRequestPayload)
    ).data;

    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage,
        shortError: response.error
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    throw formatError(error);
  }
};

export const sendEmailHash = async (
  accountAddress: string,
  email: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<CardAggregatedInfo, string>> =>
  fetchInfo(accountAddress, email, emailHash, emailSignature);

export const getCardInfo = async (
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<CardAggregatedInfo, string>> =>
  fetchInfo(accountAddress, '', emailHash, emailSignature);

export const orderCard = async (
  data: OrderCardPayload,
  accountAddress: string,
  signature: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<void, string>> => {
  try {
    const response = (
      await cardApiClient.post<OrderCardResponsePayload>('/order', {
        data: {
          info: data,
          sig: signature
        },
        meta: {
          hash: emailHash,
          address: accountAddress,
          sig: emailSignature
        }
      } as OrderCardRequestPayload)
    ).data;

    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage,
        shortError: response.error
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    throw formatError(error);
  }
};

export const validatePhoneNumber = async (
  code: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<string, string>> => {
  try {
    const response = (
      await cardApiClient.post<ValidatePhoneNumberResponsePayload>(
        '/phone/validate',
        {
          data: {
            code
          },
          meta: {
            address: accountAddress,
            hash: emailHash,
            sig: emailSignature
          }
        } as ValidatePhoneNumberRequestPayload
      )
    ).data;

    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage,
        shortError: response.error
      };
    }

    return { isError: false, result: response.payload.kycFormUrl };
  } catch (error) {
    throw formatError(error);
  }
};

export const changePhoneNumber = async (
  phone: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<void, string>> => {
  try {
    const response = (
      await cardApiClient.post<ChangePhoneNumberResponsePayload>(
        '/phone/change',
        {
          data: {
            phone
          },
          meta: {
            address: accountAddress,
            hash: emailHash,
            sig: emailSignature
          }
        } as ChangePhoneNumberRequestPayload
      )
    ).data;

    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage,
        shortError: response.error
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    throw formatError(error);
  }
};

const formatError = (error: unknown): Error => {
  const axiosError = error as AxiosError<MoverApiErrorResponse>;
  if (axiosError.response !== undefined) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return new DebitCardApiError(
      axiosError.response.data.errorMessage,
      axiosError.response.data.error
    );
  } else if (axiosError.request !== undefined) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest
    return new Error(`the request is failed, no response: ${axiosError}`);
  } else {
    // Something happened in setting up the request that triggered an Error

    if (typeof error === 'object') {
      return new Error(
        `the request is failed during setup: ${JSON.stringify(error)}`
      );
    }

    return new Error(`request is failed during setup: ${error}`);
  }
};
