import { DataStoreWrapper } from '@/store/types';

export const getFromPersistStoreWithExpire = async <T>(
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    let rawItem = null;
    try {
      rawItem = window.localStorage.getItem(`${prefix}-[${key}]`);
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
      window.localStorage.removeItem(`${prefix}-[${key}]`);
      resolve(undefined);
      return;
    }

    if (item.expDate > Date.now()) {
      resolve(item.data);
    } else {
      window.localStorage.removeItem(`${prefix}-[${key}]`);
      resolve(undefined);
    }
  });
};

export const getFromPersistStore = async <T>(
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    let rawItem = null;
    try {
      rawItem = window.localStorage.getItem(`${prefix}-[${key}]`);
    } catch (e) {
      // case, if user block localStore
      // ignore
    }
    if (rawItem === null) {
      resolve(undefined);
      return;
    }

    resolve(JSON.parse(rawItem));
  });
};

export const setToPersistStore = async <T>(
  prefix: string,
  key: string,
  val: T,
  expireDate: number
): Promise<void> => {
  return new Promise((resolve) => {
    const wrappedValue: DataStoreWrapper<T> = {
      data: val,
      expDate: expireDate
    };
    try {
      window.localStorage.setItem(
        `${prefix}-[${key}]`,
        JSON.stringify(wrappedValue)
      );
    } finally {
      resolve();
    }
  });
};
