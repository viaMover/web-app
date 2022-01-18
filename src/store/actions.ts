import { IVueI18n } from 'vue-i18n';
import { ActionTree } from 'vuex';

import {
  applyTheme,
  getPreferredTheme,
  getSavedTheme,
  getThemeColors,
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
      dispatch('changeTheme', await getPreferredTheme());
      commit('setIsThemeInitialized', true);
      return;
    }

    dispatch('changeTheme', savedTheme);
    commit('setIsThemeInitialized', true);
  },
  async changeTheme({ commit }, theme: Theme): Promise<void> {
    commit('setTheme', theme);
    applyTheme(theme);
    commit('setThemeColors', getThemeColors(theme));
  }
} as ActionTree<RootStoreState, RootStoreState>;
