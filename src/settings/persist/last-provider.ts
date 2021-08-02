import Cookies from 'js-cookie';

const persistKey = 'move_last_provider';
export const setLastProviderToPersist = (lastProvider: string): void => {
  Cookies.set(persistKey, lastProvider);
};

export const getLastProviderFromPersist = (): string | undefined => {
  return Cookies.get(persistKey);
};

export const clearLastProviderPersist = (): void => {
  Cookies.remove(persistKey, { path: '' });
};
