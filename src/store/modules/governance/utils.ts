import dayjs from 'dayjs';

export const isValidCacheItem = (
  cacheMap: Record<string, { updatedAt: number }>,
  id: string,
  expirationPeriod: number
): boolean => {
  if (cacheMap[id] === undefined) {
    return false;
  }

  const expiresAt = dayjs
    .unix(cacheMap[id].updatedAt)
    .add(expirationPeriod, 'second');

  return expiresAt.isAfter(dayjs());
};

export const isProviderRpcError = (error: unknown): boolean => {
  if (!(error instanceof Object)) {
    return false;
  }

  const candidate = error as Partial<ProviderRpcError>;
  return !(candidate.message === undefined || candidate.code === undefined);
};

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}
