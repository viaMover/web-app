import { IVueI18n } from 'vue-i18n';
import { ActionContext, Module, ModuleTree } from 'vuex';

import { Theme } from '@/settings/theme';
import { GamesStoreState } from '@/store/modules/games/types';
import { GovernanceStoreState } from '@/store/modules/governance/types';
import { ModalsStoreState } from '@/store/modules/modals/types';
import { NFTStoreState } from '@/store/modules/nft/types';
import { RadarStoreState } from '@/store/modules/radar/types';
import { SavingsStoreState } from '@/store/modules/savings/types';
import { ShopStoreState } from '@/store/modules/shop/types';
import { TreasuryStoreState } from '@/store/modules/treasury/types';

import { AccountStoreState } from './modules/account/types';
import { EarningsStoreState } from './modules/earnings/types';

export interface RootStoreState {
  i18n: IVueI18n | null;
  isThemeInitialized: boolean;
  theme: Theme;
  colors: Record<string, string>;

  // rootState members

  account?: AccountStoreState;
  shop?: ShopStoreState;
  nft?: NFTStoreState;
  governance?: GovernanceStoreState;
  radar?: RadarStoreState;
  modals?: ModalsStoreState;
  games?: GamesStoreState;
  earnings?: EarningsStoreState;
  savings?: SavingsStoreState;
  treasury?: TreasuryStoreState;
  // rootState members end
}

export type DataStoreWrapper<T> = {
  expDate: number;
  data: T;
};

export type DataStoreItem<T> = DataStoreWrapper<Promise<T>> | undefined;

export type DataStore<T> = Map<string, DataStoreItem<T>>;

export interface AugmentedActionContext<
  S,
  M extends MutationFuncs<any, S>,
  G extends GettersFuncs<any, S>
> extends Omit<ActionContext<S, RootStoreState>, 'commit' | 'getters'> {
  commit<K extends keyof M>(
    key: K,
    payload?: Parameters<M[K]>[1]
  ): ReturnType<M[K]>;
  getters: {
    [K in keyof G]: ReturnType<G[K]>;
  };
}

export type MutationFuncs<T, S> = {
  [K in keyof T]: (state: S, payload?: any) => T[K];
};

export type GettersFuncs<T, S> = {
  [K in keyof T]: (
    state: S,
    getters: {
      [k in keyof T]: T[k];
    },
    rootState: RootStoreState,
    rootGetters: any
  ) => T[K];
};

export type ActionFuncs<
  T,
  S,
  M extends MutationFuncs<any, S>,
  G extends GettersFuncs<any, S>
> = {
  [K in keyof T]: (
    context: AugmentedActionContext<S, M, G>,
    payload?: any
  ) => T[K];
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
