import { IVueI18n } from 'vue-i18n';
import { MutationTree } from 'vuex';

import { Theme } from '@/settings/theme';
import { RootStoreState } from '@/store/types';

export default {
  setI18n(state, i18n: IVueI18n): void {
    state.i18n = i18n;
  },
  setTheme(state, theme: Theme): void {
    state.theme = theme;
  },
  setPreferredTheme(state, theme: Theme): void {
    state.preferredTheme = theme;
  },
  setThemeColors(state, colors: Record<string, string>): void {
    state.colors = colors;
  },
  setIsThemeInitialized(state, isInitialized: boolean): void {
    state.isThemeInitialized = isInitialized;
  }
} as MutationTree<RootStoreState>;
