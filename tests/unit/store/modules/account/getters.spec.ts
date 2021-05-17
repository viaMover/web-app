import originalGetters from '@/store/modules/account/getters';
import { AccountStoreState } from '@/store/modules/account/types';

const getters = originalGetters as Record<
  string,
  (store: AccountStoreState) => never
>;

describe('Account store getters', () => {
  describe('transactionsGroupedByDay', () => {
    it('should return valid groups', () => {
      const state = {
        transactions: [
          { timeStamp: 1608708729, hash: '' },
          { timeStamp: 1608707729, hash: '' },
          { timeStamp: 1609708729, hash: '' },
          { timeStamp: 1508738729, hash: '' }
        ],
        addresses: [],
        currentAddress: null
      } as AccountStoreState;

      const expectedTransactionGroups = [
        {
          timeStamp: 1508695200,
          transactions: [{ hash: '', timeStamp: 1508738729 }]
        },
        {
          timeStamp: 1608660000,
          transactions: [
            { hash: '', timeStamp: 1608708729 },
            { hash: '', timeStamp: 1608707729 }
          ]
        },
        {
          timeStamp: 1609696800,
          transactions: [{ hash: '', timeStamp: 1609708729 }]
        }
      ];

      expect(getters.transactionsGroupedByDay(state)).toEqual(
        expectedTransactionGroups
      );
    });
  });
});
