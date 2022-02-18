import { stringIsTheme, Theme } from '../theme/types';

const themePersistKey = 'theme';
export const setCurrentThemeToPersist = async (theme: Theme): Promise<void> => {
  localStorage.setItem(themePersistKey, theme);
};

export const getCurrentThemeFromPersist = async (): Promise<
  Theme | undefined
> => {
  const persistedItem = localStorage.getItem(themePersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  return stringIsTheme(persistedItem) ? persistedItem : undefined;
};
