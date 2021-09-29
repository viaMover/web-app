import dayjs from 'dayjs';

export const isValidCacheItem = (
  cacheMap: Record<string, { updatedAt: number }>,
  id: string,
  expirationPeriod: number
): boolean => {
  if (cacheMap[id] === undefined) {
    return false;
  }

  return dayjs
    .unix(cacheMap[id].updatedAt)
    .add(expirationPeriod, 'second')
    .isBefore(dayjs());
};

export const isProviderRpcError = (error: unknown): boolean => {
  if (!(error instanceof Object)) {
    return false;
  }

  const candidate = error as Partial<ProviderRpcError>;
  if (candidate.message === undefined || candidate.code === undefined) {
    return false;
  }

  return true;
};

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}
