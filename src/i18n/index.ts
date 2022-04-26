import Vue from 'vue';
import VueI18n from 'vue-i18n';

import axios from 'axios';

import en from './messages/en.json';

Vue.use(VueI18n);

// Upon adding the new language also visit
// @/dayjs/index.ts and update webpack dynamic import regex
export enum Language {
  English = 'en',
  Russian = 'ru'
}

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    [Language.English]: en
  }
});

export type LanguageEntryItem = {
  code: Language;
  name: string;
  isDefault?: boolean;
};

export const availableLanguages: Array<LanguageEntryItem> = [
  { code: Language.English, name: 'English', isDefault: true },
  { code: Language.Russian, name: 'Русский' }
];

const loadedLanguages = ['en']; // our default language that is preloaded

export function setI18nLanguage(lang: Language): string {
  i18n.locale = lang;
  axios.defaults.headers.common['Accept-Language'] = lang;
  document.querySelector('html')?.setAttribute('lang', lang);
  return lang;
}

export async function loadLanguageAsync(lang?: Language): Promise<void> {
  if (lang == null) {
    setI18nLanguage(i18n.locale as Language);
    return;
  }

  // If the same language
  if (i18n.locale === lang) {
    setI18nLanguage(lang);
    return;
  }

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    setI18nLanguage(lang);
    return;
  }

  // If the language hasn't been loaded yet
  try {
    const messages = await import(
      /* webpackInclude: /\.json/ */
      /* webpackExclude: /\.ts/ */
      /* webpackChunkName: "locales-[request]" */
      /* webpackMode: "lazy" */
      /* webpackPrefetch: true */
      `./messages/${lang}.json`
    );
    i18n.setLocaleMessage(lang, messages.default);
    loadedLanguages.push(lang);
    setI18nLanguage(lang);
  } catch (error) {
    setI18nLanguage(i18n.locale as Language);
    throw error;
  }
}

export default i18n;
