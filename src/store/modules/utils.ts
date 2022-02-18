import { DataStoreWrapper } from '@/store/types';

export const unwrapCacheItem = <DataType>(
  item: DataStoreWrapper<DataType> | undefined
): DataType | undefined => {
  if (item === undefined) {
    return undefined;
  }

  if (item.expDate > Date.now()) {
    return item.data;
  }

  return undefined;
};

export const wrapCacheItem = <T>(
  item: T,
  expTime: number
): DataStoreWrapper<T> => {
  return {
    data: item,
    expDate: Date.now() + expTime
  };
};
