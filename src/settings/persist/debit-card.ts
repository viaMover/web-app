import dayjs from 'dayjs';

import { SkinMinimal } from '@/store/modules/debit-card/types';

import { AccountBoundPersistedItem } from './types';

const debitCardPersistKey = 'debit_card_current_skin';

type DebitCardPersistItem = AccountBoundPersistedItem<SkinMinimal>;

export const setCurrentSkinToPersist = async (
  address: string,
  item: SkinMinimal,
  withExpiration: boolean
): Promise<void> => {
  const persistedItem = await getDebitCardPersistItem();
  if (persistedItem === undefined) {
    const candidate: DebitCardPersistItem = {
      [address]: item
    };

    if (withExpiration) {
      candidate[address].expirationDate = dayjs().add(1, 'week').toISOString();
    }

    localStorage.setItem(debitCardPersistKey, JSON.stringify(candidate));
    return;
  }

  persistedItem[address] = item;
  localStorage.setItem(debitCardPersistKey, JSON.stringify(persistedItem));
};

export const getCurrentSkinFromPersist = async (
  address: string
): Promise<(SkinMinimal & { isExpired: boolean }) | undefined> => {
  const persistedItem = await getDebitCardPersistItem();
  if (persistedItem === undefined) {
    return undefined;
  }

  const addressBoundItem = persistedItem[address];
  return {
    id: addressBoundItem.id,
    nftAddress: addressBoundItem.nftAddress,
    symbol: addressBoundItem.symbol,
    color: addressBoundItem.color,
    isExpired:
      addressBoundItem.expirationDate === undefined
        ? false
        : dayjs().isAfter(dayjs(addressBoundItem.expirationDate))
  };
};

const getDebitCardPersistItem = async (): Promise<
  DebitCardPersistItem | undefined
> => {
  const persistedItem = localStorage.getItem(debitCardPersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  try {
    return JSON.parse(persistedItem) as DebitCardPersistItem;
  } catch (e) {
    localStorage.removeItem(debitCardPersistKey);
    return undefined;
  }
};

const debitCardAvailableSkinsPersistKey = 'debit_card_available_skins';

type DebitCardAvailableSkinsPersistItem = {
  [accountAddress: string]: {
    [nftAddress: string]: {
      expirationDate: string;
    };
  };
};

export const setAvailableSkinsToPersist = async (
  address: string,
  info: Array<SkinMinimal>
): Promise<void> => {
  const itemsToMerge = info
    .filter((item) => item.nftAddress !== undefined)
    .reduce((acc, item) => {
      return {
        ...acc,
        [item.nftAddress ?? 'missing_address']: {
          expirationDate: dayjs().add(1, 'week').toISOString()
        }
      };
    }, {});

  const persistedItem = await getNFTExistenceInfoPersistItem();
  if (persistedItem === undefined) {
    const candidate = {
      [address]: itemsToMerge
    };

    localStorage.setItem(
      debitCardAvailableSkinsPersistKey,
      JSON.stringify(candidate)
    );
    return;
  }

  persistedItem[address] = {
    ...persistedItem[address],
    ...itemsToMerge
  };
  localStorage.setItem(
    debitCardAvailableSkinsPersistKey,
    JSON.stringify(persistedItem)
  );
};

export const getAvailableSkinsFromPersist = async (
  address: string
): Promise<Array<string>> => {
  const persistedItem = await getNFTExistenceInfoPersistItem();
  if (persistedItem === undefined) {
    return [];
  }

  const accountBoundItem = persistedItem[address];
  if (accountBoundItem === undefined) {
    return [];
  }

  return Object.entries(accountBoundItem)
    .filter((entry) => !dayjs().isAfter(dayjs(entry[1].expirationDate)))
    .map((entry) => entry[0]);
};

const getNFTExistenceInfoPersistItem = async (): Promise<
  DebitCardAvailableSkinsPersistItem | undefined
> => {
  const persistedItem = localStorage.getItem(debitCardAvailableSkinsPersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  try {
    return JSON.parse(persistedItem) as DebitCardAvailableSkinsPersistItem;
  } catch (e) {
    localStorage.removeItem(debitCardAvailableSkinsPersistKey);
    return undefined;
  }
};
