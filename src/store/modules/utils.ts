import { DataStoreWrapper } from '@/store/types';

export const unwrapCacheItem = <DataType>(
  item: DataStoreWrapper<DataType> | undefined,
  skipExpirationDateCheck = false
): DataType | undefined => {
  if (item === undefined) {
    return undefined;
  }

  if (skipExpirationDateCheck) {
    return item.data;
  }

  if (item.expDate > Date.now()) {
    return item.data;
  }

  return undefined;
};

export const wrapCacheItem = <T>(
  item: T,
  expTime: number | null
): DataStoreWrapper<T> => {
  if (expTime === null) {
    return {
      data: item,
      expDate: -1
    };
  }

  return {
    data: item,
    expDate: Date.now() + expTime
  };
};
