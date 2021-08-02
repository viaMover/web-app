import { Avatar } from '@/store/modules/account/types';
import { AccountBoundPersistedItem } from '@/settings/persist/types';

const persistKey = 'user_avatar';
type AvatarPersistItem = AccountBoundPersistedItem<Avatar>;
export const setAvatarToPersist = async (
  address: string,
  item: Avatar
): Promise<void> => {
  const persistedItem = await getAvatarPersistItem();
  if (persistedItem === undefined) {
    const candidate: AvatarPersistItem = {
      [address]: item
    };
    localStorage.setItem(persistKey, JSON.stringify(candidate));
    return;
  }

  persistedItem[address] = item;
  localStorage.setItem(persistKey, JSON.stringify(persistedItem));
};

export const getAvatarFromPersist = async (
  address: string
): Promise<Avatar | undefined> => {
  const persistedItem = await getAvatarPersistItem();
  if (persistedItem === undefined) {
    return undefined;
  }

  return persistedItem[address];
};

const getAvatarPersistItem = async (): Promise<
  AvatarPersistItem | undefined
> => {
  const persistedItem = localStorage.getItem(persistKey);
  if (persistedItem === null) {
    return undefined;
  }

  try {
    return JSON.parse(persistedItem) as AvatarPersistItem;
  } catch (e) {
    localStorage.removeItem(persistKey);
    return undefined;
  }
};
