import { IVueI18n } from 'vue-i18n';
import { ActionTree } from 'vuex';

import { setDayjsLocale } from '@/dayjs';
import { availableLanguages, Language, loadLanguageAsync } from '@/i18n';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  getCurrentLanguageFromPersist,
  setCurrentLanguageToPersist
} from '@/settings/persist/language';
import {
  applyTheme,
  getPreferredTheme,
  getSavedTheme,
  getThemeColors,
  queryMediaTheme,
  Theme
} from '@/settings/theme';
import { RootStoreState } from '@/store/types';

export default {
  setI18n({ commit }, i18n: IVueI18n): void {
    commit('setI18n', i18n);
  },
  async initTheme({ state, commit, dispatch }): Promise<void> {
    if (state.isThemeInitialized) {
      return;
    }

    const savedTheme = await getSavedTheme();
    if (savedTheme === undefined) {
      dispatch('changeTheme', Theme.System);
      commit('setIsThemeInitialized', true);
      return;
    }

    dispatch('changeTheme', savedTheme);
    commit('setIsThemeInitialized', true);
  },
  async changeTheme({ commit, dispatch }, theme: Theme): Promise<void> {
    if (queryMediaTheme !== undefined) {
      if (queryMediaTheme.onchange !== null && theme !== Theme.System) {
        // remove event listener manually
        queryMediaTheme.onchange = null;
      }

      if (queryMediaTheme.onchange === null && theme === Theme.System) {
        // set up event listener
        queryMediaTheme.onchange = () => dispatch('changeTheme', Theme.System);
      }
    }

    commit('setPreferredTheme', theme);

    if (theme === Theme.System) {
      const preferredTheme = getPreferredTheme();
      commit('setTheme', preferredTheme);
      applyTheme(preferredTheme, false);
      commit('setThemeColors', getThemeColors(preferredTheme));
      return;
    }

    commit('setTheme', theme);
    applyTheme(theme);
    commit('setThemeColors', getThemeColors(theme));
  },
  async restoreLanguage(): Promise<void> {
    const savedLanguage = await getCurrentLanguageFromPersist();
    if (savedLanguage === undefined) {
      let userAgentPreferredLang = null;
      if (window.navigator?.languages) {
        userAgentPreferredLang = window.navigator.languages[0];
      }

      if (!userAgentPreferredLang && window.navigator?.language) {
        userAgentPreferredLang = window.navigator.language;
      }

      if (!userAgentPreferredLang) {
        addSentryBreadcrumb({
          type: 'debug',
          message:
            'Failed to detect user agent preferred lang. Both language and languages are empty'
        });
        return;
      }

      // remove variations (e.g. en-US -> en)
      let userAgentShortPreferredLang = userAgentPreferredLang;
      if (userAgentShortPreferredLang.indexOf('-') !== -1) {
        userAgentShortPreferredLang = userAgentShortPreferredLang.split('-')[0];
      }

      // remove variations (e.g. en_US -> en)
      if (userAgentShortPreferredLang.indexOf('_') !== -1) {
        userAgentShortPreferredLang = userAgentShortPreferredLang.split('_')[0];
      }

      // check if the language is supported
      if (
        !availableLanguages.some(
          (lang) => lang.code === userAgentShortPreferredLang
        )
      ) {
        addSentryBreadcrumb({
          type: 'debug',
          message:
            'Failed to set language: not supported, fall back to default',
          data: {
            userAgentPreferredLang,
            userAgentShortPreferredLang
          }
        });
        return;
      }

      const uiLanguagePromise = loadLanguageAsync(
        userAgentPreferredLang as Language
      ).catch(() => loadLanguageAsync(userAgentShortPreferredLang as Language));
      const dayjsLanguagePromise = setDayjsLocale(
        userAgentPreferredLang as Language
      ).catch(() => setDayjsLocale(userAgentShortPreferredLang as Language));

      await Promise.all([uiLanguagePromise, dayjsLanguagePromise]);
      return;
    }

    await Promise.all([
      loadLanguageAsync(savedLanguage),
      setDayjsLocale(savedLanguage)
    ]);
  },
  async setLanguage(ctx, langCode: string): Promise<void> {
    const safeLangCode = availableLanguages.find(
      (al) => langCode.toLowerCase() === al.code.toLowerCase()
    )?.code;

    if (safeLangCode === undefined) {
      throw new Error('lang code is not supported');
    }

    await Promise.all([
      loadLanguageAsync(safeLangCode),
      setDayjsLocale(safeLangCode),
      setCurrentLanguageToPersist(safeLangCode)
    ]);
  }
} as ActionTree<RootStoreState, RootStoreState>;
