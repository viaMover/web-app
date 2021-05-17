import { MutationTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { IVueI18n } from 'vue-i18n';

export default {
  setI18n(state, i18n: IVueI18n) {
    state.i18n = i18n;
  }
} as MutationTree<RootStoreState>;
