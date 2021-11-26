import * as Sentry from '@sentry/vue';
import axios, { AxiosError } from 'axios';

import { Result } from '../../responses';
import { baseUrl } from '../consts';
import { ErrorResponse as MoverApiErrorResponse } from '../responses';
import {
  BaseReturn,
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
  baseURL: `${baseUrl}2/v1/cards`,
  headers: {
    Accept: 'application/json'
  }
});

const fetchInfo = async (
  accountAddress: string,
  email: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> => {
  try {
    const response = (
      await cardApiClient.post<CardInfoResponsePayload>('/info', {
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
        error: response.error,
        shortError: response.errorCode
      };
    }

    return {
      isError: false,
      result: response.payload
    };
  } catch (error) {
    const formattedError = formatError(error);
    if (formattedError instanceof DebitCardApiError) {
      return {
        isError: true,
        error: formattedError.message,
        shortError: formattedError.shortMessage
      };
    }

    throw formattedError;
  }
};

export const sendEmailHash = async (
  accountAddress: string,
  email: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> =>
  fetchInfo(accountAddress, email, emailHash, emailSignature);

export const getCardInfo = async (
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> =>
  fetchInfo(accountAddress, '', emailHash, emailSignature);

export const orderCard = async (
  data: OrderCardPayload,
  accountAddress: string,
  signature: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> => {
  try {
    const response = (
      await cardApiClient.post<OrderCardResponsePayload>('/signup', {
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
        error: response.error,
        shortError: response.errorCode
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    const formattedError = formatError(error);
    if (formattedError instanceof DebitCardApiError) {
      return {
        isError: true,
        error: formattedError.message,
        shortError: formattedError.shortMessage
      };
    }

    throw formattedError;
  }
};

export const validatePhoneNumber = async (
  code: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> => {
  try {
    const response = (
      await cardApiClient.post<ValidatePhoneNumberResponsePayload>(
        '/verifyPhone',
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
        error: response.error,
        shortError: response.errorCode
      };
    }

    return {
      isError: false,
      result: response.payload
    };
  } catch (error) {
    const formattedError = formatError(error);
    if (formattedError instanceof DebitCardApiError) {
      return {
        isError: true,
        error: formattedError.message,
        shortError: formattedError.shortMessage
      };
    }

    throw formattedError;
  }
};

export const changePhoneNumber = async (
  phone: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<BaseReturn, string>> => {
  try {
    const response = (
      await cardApiClient.post<ChangePhoneNumberResponsePayload>(
        '/updatePhone',
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
        error: response.error,
        shortError: response.errorCode
      };
    }

    return {
      isError: false,
      result: response.payload
    };
  } catch (error) {
    const formattedError = formatError(error);
    if (formattedError instanceof DebitCardApiError) {
      return {
        isError: true,
        error: formattedError.message,
        shortError: formattedError.shortMessage
      };
    }

    throw formattedError;
  }
};

const formatError = (error: unknown): Error => {
  const axiosError = error as AxiosError<MoverApiErrorResponse>;
  if (axiosError.config !== undefined) {
    const requestUrl = `${axiosError.config?.baseURL}${axiosError.config?.url}`;
    const code = axiosError.code;

    Sentry.addBreadcrumb({
      message: 'A request to the Debit Card API is failed',
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

    Sentry.addBreadcrumb({
      message: 'Debit Card API responded with an error',
      data: {
        error: axiosError.response.data.error,
        shortError: axiosError.response.data.errorCode
      }
    });

    return new DebitCardApiError(
      axiosError.response.data.error,
      axiosError.response.data.errorCode
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
