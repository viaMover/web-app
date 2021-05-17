import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { IVueI18n } from 'vue-i18n';

export default {
  setI18n({ commit }, i18n: IVueI18n): void {
    commit('setI18n', i18n);
  }
} as ActionTree<RootStoreState, RootStoreState>;
