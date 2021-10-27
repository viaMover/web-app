import { ActionTree } from 'vuex';

import { RootStoreState } from '../../types';
import { DebitCardStoreState } from './types';

export default {
  async loadActiveSkin({ commit, rootState }): Promise<void> {
    //
  }
} as ActionTree<DebitCardStoreState, RootStoreState>;
