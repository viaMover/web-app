import dayjs from 'dayjs';

import { OrderCardParams } from '@/store/modules/debit-card/types';

import { Result } from '../../responses';
import { CardAggregatedInfo } from './types';

export const getCardInfo = async (
  accountAddress: string,
  email: string,
  emailSignature: string
): Promise<Result<CardAggregatedInfo, string>> => {
  const payload = {
    accountAddress,
    data: {
      email: email
    },
    signature: emailSignature
  };

  console.debug(payload);

  const now = dayjs();
  return {
    isError: false,
    result: {
      state: 'active',
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
  data: OrderCardParams,
  accountAddress: string,
  signature: string
): Promise<Result<string, string>> => {
  const payload = {
    data,
    accountAddress,
    signature
  };

  console.debug(payload);

  return {
    isError: true,
    error: 'not implemented yet'
  };
};

export const validateCard = async (
  code: string,
  accountAddress: string,
  email: string,
  signature: string
): Promise<Result<void, string>> => {
  const payload = {
    code,
    accountAddress,
    data: {
      email
    },
    signature
  };

  console.debug(payload);

  return {
    isError: true,
    error: 'not implemented yet'
  };
};
