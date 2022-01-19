import { IVueI18n } from 'vue-i18n';
import { ActionContext, Module, ModuleTree } from 'vuex';

import { GamesStoreState } from '@/store/modules/games/types';
import { GovernanceStoreState } from '@/store/modules/governance/types';
import { ModalsStoreState } from '@/store/modules/modals/types';
import { NFTStoreState } from '@/store/modules/nft/types';
import { RadarStoreState } from '@/store/modules/radar/types';
import { ShopStoreState } from '@/store/modules/shop/types';

import { AccountStoreState } from './modules/account/types';
import { EarningsStoreState } from './modules/earnings/types';

export interface RootStoreState {
  appVersion: string;
  i18n: IVueI18n | null;

  // rootState members

  account?: AccountStoreState;
  shop?: ShopStoreState;
  nft?: NFTStoreState;
  governance?: GovernanceStoreState;
  radar?: RadarStoreState;
  modals?: ModalsStoreState;
  games?: GamesStoreState;
  earnings?: EarningsStoreState;
  // rootState members end
}

export interface AugmentedActionContext<T, S, M extends MutationFuncs<T, S>>
  extends Omit<ActionContext<S, RootStoreState>, 'commit'> {
  commit<K extends keyof M>(
    key: K,
    payload?: Parameters<M[K]>[1]
  ): ReturnType<M[K]>;
}

export type MutationFuncs<T, S> = {
  [K in keyof T]: (state: S, payload?: any) => any;
};

export type ActionFuncs<T, S, M extends MutationFuncs<any, S>> = {
  [K in keyof T]: (
    context: AugmentedActionContext<any, S, M>,
    payload?: any
  ) => any;
};

export type GettersFuncs<T, S> = {
  [K in keyof T]: (
    state: S,
    getters: any,
    rootState: RootStoreState,
    rootGetters: any
  ) => any;
};

export interface AugmentedModule<S, A, G, M>
  extends Omit<
    Module<S, RootStoreState>,
    'actions' | 'getters' | 'mutations' | 'modules'
  > {
  actions?: A;
  getters?: G;
  mutations?: M;
  modules?: ModuleTree<RootStoreState>;
}
