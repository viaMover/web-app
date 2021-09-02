import dayjs from 'dayjs';

import { Avatar } from '@/store/modules/account/types';
import { AccountBoundPersistedItem } from '@/settings/persist/types';
import { isOlympusAvatar } from '../../../data/olympus-avatar';

const avatarPersistKey = 'user_avatar';
type AvatarPersistItem = AccountBoundPersistedItem<Avatar>;
export const setAvatarToPersist = async (
  address: string,
  item: Avatar
): Promise<void> => {
  const persistedItem = await getAvatarPersistItem();
  if (persistedItem === undefined) {
    let candidate: AvatarPersistItem = {
      [address]: item
    };

    if (isOlympusAvatar(item)) {
      candidate = {
        [address]: {
          ...item,
          expirationDate: dayjs().add(1, 'hour').toISOString()
        }
      };
    }

    localStorage.setItem(avatarPersistKey, JSON.stringify(candidate));
    return;
  }

  persistedItem[address] = item;
  if (isOlympusAvatar(item)) {
    persistedItem[address] = {
      ...item,
      expirationDate: dayjs().add(1, 'hour').toISOString()
    };
  }

  localStorage.setItem(avatarPersistKey, JSON.stringify(persistedItem));
};

export const getAvatarFromPersist = async (
  address: string
): Promise<Avatar | undefined> => {
  const persistedItem = await getAvatarPersistItem();
  if (persistedItem === undefined) {
    return undefined;
  }

  const addressBoundItem = persistedItem[address];
  if (addressBoundItem.type === undefined) {
    return undefined; // compatibility check for Olympus NFT avatar feature
  }

  // discard persisted expired item info
  if (
    addressBoundItem.expirationDate !== undefined &&
    dayjs().isAfter(dayjs(addressBoundItem.expirationDate))
  ) {
    return undefined;
  }

  return addressBoundItem;
};

const getAvatarPersistItem = async (): Promise<
  AvatarPersistItem | undefined
> => {
  const persistedItem = localStorage.getItem(avatarPersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  try {
    return JSON.parse(persistedItem) as AvatarPersistItem;
  } catch (e) {
    localStorage.removeItem(avatarPersistKey);
    return undefined;
  }
};

const olympusAvatarPersistKey = 'is_olympus_known';
type IsOlympusAvatarKnownPersistItem = AccountBoundPersistedItem<boolean>;

export const getIsOlympusAvatarKnownFromPersist = async (
  address: string
): Promise<boolean> => {
  const persistedItem = await getIsOlympusAvatarKnownPersistItem();
  if (persistedItem === undefined) {
    return false;
  }

  return persistedItem[address];
};

export const setIsOlympusAvatarKnownToPersist = async (
  address: string,
  isKnown: boolean
): Promise<void> => {
  const persistedItem = await getIsOlympusAvatarKnownPersistItem();
  if (persistedItem === undefined) {
    if (!isKnown) {
      return;
    }

    const candidate: IsOlympusAvatarKnownPersistItem = {
      [address]: true
    };
    localStorage.setItem(olympusAvatarPersistKey, JSON.stringify(candidate));
    return;
  }

  if (!isKnown && persistedItem[address] !== undefined) {
    delete persistedItem[address];

    localStorage.setItem(
      olympusAvatarPersistKey,
      JSON.stringify(persistedItem)
    );
    return;
  }

  persistedItem[address] = true;
  localStorage.setItem(olympusAvatarPersistKey, JSON.stringify(persistedItem));
};

const getIsOlympusAvatarKnownPersistItem = async (): Promise<
  IsOlympusAvatarKnownPersistItem | undefined
> => {
  const persistedItem = localStorage.getItem(olympusAvatarPersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  try {
    return JSON.parse(persistedItem) as IsOlympusAvatarKnownPersistItem;
  } catch (e) {
    localStorage.removeItem(olympusAvatarPersistKey);
    return undefined;
  }
};
