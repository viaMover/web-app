import dayjs from 'dayjs';

import { Result } from '../../responses';
import {
  CardAggregatedInfo,
  CardInfoRequestPayload,
  ChangePhoneNumberRequestPayload,
  OrderCardPayload,
  OrderCardRequestPayload,
  ValidatePhoneNumberRequestPayload
} from './types';

export const getCardInfo = async (
  accountAddress: string,
  email: string | undefined,
  emailHash: string,
  emailSignature: string
): Promise<Result<CardAggregatedInfo, string>> => {
  const payload: CardInfoRequestPayload = {
    data: {
      email: email ?? null
    },
    meta: {
      emailHash,
      accountAddress,
      emailSignature
    }
  };

  console.debug('getCardInfo payload', payload);

  const now = dayjs();
  return {
    isError: false,
    result: {
      state: 'order_now',
      orderState: 'order_form',
      eventHistory: [
        {
          timestamp: 1630215570,
          type: 'order_process_started'
        },
        {
          timestamp: now.subtract(1, 'day').unix(),
          type: 'kyc_process_started'
        },
        {
          timestamp: now.subtract(1, 'day').add(5, 'hours').unix(),
          type: 'documents_verified'
        },
        {
          timestamp: now.unix(),
          type: 'card_shipped'
        }
      ],
      info: {
        bic: '21938124869',
        iban: '12934189589158',
        expiryDate: '12/24',
        number: '8097809780978097'
      }
    }
  };
};

export const orderCard = async (
  data: OrderCardPayload,
  accountAddress: string,
  signature: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<void, string>> => {
  const payload: OrderCardRequestPayload = {
    data: {
      info: data,
      signature: signature
    },
    meta: {
      emailHash,
      accountAddress,
      emailSignature
    }
  };

  console.debug(payload);

  // return {
  //   isError: true,
  //   error: 'not implemented yet'
  // };
  return {
    isError: false,
    result: undefined
  };
};

export const validatePhoneNumber = async (
  code: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<void, string>> => {
  const payload: ValidatePhoneNumberRequestPayload = {
    data: {
      code
    },
    meta: {
      accountAddress,
      emailHash,
      emailSignature
    }
  };

  console.debug('validatePhoneNumber payload', payload);

  return {
    isError: true,
    error: 'not implemented yet'
  };
};

export const changePhoneNumber = async (
  phone: string,
  accountAddress: string,
  emailHash: string,
  emailSignature: string
): Promise<Result<void, string>> => {
  const payload: ChangePhoneNumberRequestPayload = {
    data: {
      phone
    },
    meta: {
      accountAddress,
      emailHash,
      emailSignature
    }
  };

  console.debug('changePhoneNumber payload', payload);

  return {
    isError: true,
    error: 'not implemented yet'
  };
};
