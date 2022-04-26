import { Language } from '@/i18n';

const languagePersistKey = 'language';
export const setCurrentLanguageToPersist = async (
  langCode: string
): Promise<void> => {
  localStorage.setItem(languagePersistKey, langCode);
};

export const getCurrentLanguageFromPersist = async (): Promise<
  Language | undefined
> => {
  const persistedItem = localStorage.getItem(languagePersistKey);
  if (persistedItem === null) {
    return undefined;
  }

  return persistedItem as Language;
};
