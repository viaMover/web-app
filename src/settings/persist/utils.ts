import { unwrapCacheItem, wrapCacheItem } from '@/store/modules/utils';
import { DataStoreWrapper } from '@/store/types';

const isStorageAvailable = (
  type: 'localStorage' | 'sessionStorage'
): boolean => {
  try {
    const storage = window[type];
    const val = '__storage_test__';

    storage.setItem(val, val);
    storage.removeItem(val);
    return true;
  } catch (e) {
    return false;
  }
};

const getLocalStorageKeys = (): Array<string> => {
  if (!isStorageAvailable('localStorage')) {
    return [];
  }

  return Object.keys(window.localStorage);
};

export const removeAccountBoundPersistItemsFromLocalStorage = (
  currentAddress: string
): void => {
  const keysWithPostfix = getLocalStorageKeys().filter((key) =>
    key.endsWith(currentAddress)
  );

  keysWithPostfix.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  });
};

const isMoverEntryType = (
  value: Record<string, unknown> | null | undefined
): value is DataStoreWrapper<unknown> => {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  try {
    return typeof value.expDate === 'number';
  } catch (error) {
    return false;
  }
};

export const removeExpiredPersistItemsFromLocalStorage = (): void => {
  getLocalStorageKeys().forEach((key) => {
    try {
      const persistedValue = window.localStorage.getItem(key);
      if (persistedValue === null) {
        return;
      }

      const value = JSON.parse(persistedValue);

      if (
        isMoverEntryType(value) &&
        value.expDate !== -1 &&
        value.expDate < Date.now()
      ) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      return;
    }
  });
};

export const getFromPersistStoreWithExpire = async <T>(
  currentAddress: string,
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    let rawItem = null;
    try {
      rawItem = window.localStorage.getItem(
        buildPersistKey(currentAddress, prefix, key)
      );
    } catch (e) {
      // case, if user block localStore
      // ignore
    }
    if (rawItem === null) {
      resolve(undefined);
      return;
    }

    let item;
    try {
      item = JSON.parse(rawItem) as DataStoreWrapper<T>;
    } catch (e) {
      //remove bad item
      window.localStorage.removeItem(
        buildPersistKey(currentAddress, prefix, key)
      );
      resolve(undefined);
      return;
    }

    const val = unwrapCacheItem(item);
    if (val !== undefined) {
      resolve(val);
    } else {
      window.localStorage.removeItem(
        buildPersistKey(currentAddress, prefix, key)
      );
      resolve(undefined);
    }
  });
};

export const getFromPersistStore = async <T>(
  currentAddress: string,
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    let rawItem = null;
    try {
      rawItem = window.localStorage.getItem(
        buildPersistKey(currentAddress, prefix, key)
      );
    } catch (e) {
      // case, if user block localStore
      // ignore
    }
    if (rawItem === null) {
      resolve(undefined);
      return;
    }

    let item;
    try {
      item = JSON.parse(rawItem) as DataStoreWrapper<T>;
    } catch (e) {
      //remove bad item
      window.localStorage.removeItem(
        buildPersistKey(currentAddress, prefix, key)
      );
      resolve(undefined);
      return;
    }

    const val = unwrapCacheItem(item, true);
    if (val !== undefined) {
      resolve(val);
    } else {
      window.localStorage.removeItem(
        buildPersistKey(currentAddress, prefix, key)
      );
      resolve(undefined);
    }
  });
};

export const setToPersistStore = async <T>(
  currentAddress: string,
  prefix: string,
  key: string,
  val: T,
  expTime?: number
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const item =
        expTime === undefined
          ? wrapCacheItem(val, null)
          : wrapCacheItem(val, expTime);
      window.localStorage.setItem(
        buildPersistKey(currentAddress, prefix, key),
        JSON.stringify(item)
      );
    } finally {
      resolve();
    }
  });
};

const buildPersistKey = (
  currentAddress: string,
  prefix: string,
  key: string
): string => `${prefix}-[${key}]-${currentAddress}`;
