import { DataStoreWrapper } from '@/store/types';

export const getFromPersistStoreWithExpire = async <T>(
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    const rawItem = window.localStorage.getItem(`${prefix}-[${key}]`);
    if (rawItem === null) {
      resolve(undefined);
      return;
    }

    const item = JSON.parse(rawItem) as DataStoreWrapper<T>;

    if (item.expDate > Date.now()) {
      window.localStorage.removeItem(`${prefix}-[${key}]`);
      resolve(undefined);
    } else {
      resolve(item.data as T);
    }
  });
};

export const getFromPersistStore = async <T>(
  prefix: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    const rawItem = window.localStorage.getItem(`${prefix}-[${key}]`);
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
    window.localStorage.setItem(
      `${prefix}-[${key}]`,
      JSON.stringify(wrappedValue)
    );
    resolve();
  });
};
