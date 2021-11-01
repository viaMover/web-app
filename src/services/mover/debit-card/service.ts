import dayjs from 'dayjs';

import { Result } from '../../responses';
import { CardAggregatedInfo } from './types';

export const getCardInfo = async (
  accountAddress: string
): Promise<Result<CardAggregatedInfo, string>> => {
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
          type: 'order_process_started'
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
