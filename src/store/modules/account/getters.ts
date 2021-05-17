import { GetterTree } from 'vuex';
import { AccountStoreState, Transaction, TransactionGroup } from './types';
import { RootStoreState } from '@/store/types';
import dayjs from 'dayjs';

export default {
  transactionsGroupedByDay(state): Array<TransactionGroup> {
    const groupsByDay = state.transactions.reduce(
      (
        res: Record<number, TransactionGroup>,
        tx: Transaction
      ): Record<number, TransactionGroup> => {
        const groupKey = dayjs.unix(tx.timeStamp).startOf('day').unix();
        if (res[groupKey] !== undefined) {
          const retVal = { ...res[groupKey] };
          retVal.transactions.push(tx);

          return { ...res, [groupKey]: retVal };
        }

        return {
          ...res,
          [groupKey]: { timeStamp: groupKey, transactions: [tx] }
        };
      },
      {}
    );

    return Object.values(groupsByDay);
  }
} as GetterTree<AccountStoreState, RootStoreState>;
