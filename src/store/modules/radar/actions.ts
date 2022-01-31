import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import { Asset, RadarStoreState } from './types';

type Actions = {
  loadPersonalList: Promise<Array<Asset>>;
  loadCuratedList: Promise<Array<Asset>>;
};

const actions: ActionFuncs<Actions, RadarStoreState, MutationType, GetterType> =
  {
    async loadPersonalList({ state, commit }): Promise<Array<Asset>> {
      if (
        state.isLoadingPersonalList &&
        state.loadingPersonalListPromise !== undefined
      ) {
        return state.loadingPersonalListPromise;
      }

      if (!state.isLoadingPersonalList && state.personalList !== undefined) {
        return Promise.resolve(state.personalList);
      }

      commit('setIsLoadingPersonalList', true);

      // TODO get remote info about personal list
      // commit("setLoadingPromise", <loadingPromise>);
      const localEntries: Array<Asset> = [
        {
          id: 0,
          name: 'Anton Z',
          icon: require('@/assets/images/personal-lists-icon1.jpg'),
          blackBorder: true
        },
        {
          id: 1,
          name: 'Anton M',
          icon: require('@/assets/images/personal-lists-icon2.jpg'),
          blackBorder: false
        },
        {
          id: 2,
          name: 'Monkey',
          icon: require('@/assets/images/personal-lists-icon3.png'),
          blackBorder: false
        },
        {
          id: 3,
          name: 'Magic',
          icon: require('@/assets/images/personal-lists-icon4.jpg'),
          blackBorder: false
        },
        {
          id: 4,
          name: 'vfat0',
          icon: require('@/assets/images/personal-lists-icon5.png'),
          blackBorder: true
        },
        {
          id: 5,
          name: 'vfat0',
          icon: require('@/assets/images/personal-lists-icon5.png'),
          blackBorder: true
        }
      ];

      return new Promise((resolve) => {
        setTimeout(() => {
          commit(
            'setLoadingPersonalListPromise',
            Promise.resolve(localEntries)
          );
          commit('setPersonalList', localEntries);
          commit('setLoadingPersonalListPromise', undefined);
          commit('setIsLoadingPersonalList', false);
        }, 1000);
        resolve(localEntries);
      });
    },
    async loadCuratedList({ state, commit }): Promise<Array<Asset>> {
      if (
        state.isLoadingCuratedList &&
        state.loadingCuratedListPromise !== undefined
      ) {
        return state.loadingCuratedListPromise;
      }

      if (!state.isLoadingCuratedList && state.curatedList !== undefined) {
        return Promise.resolve(state.curatedList);
      }

      commit('setIsLoadingCuratedList', true);

      // TODO get remote info about personal list
      // commit("setLoadingPromise", <loadingPromise>);
      const localEntries: Array<Asset> = [
        {
          id: 0,
          name: 'Futur of Franc',
          icon: require('@/assets/images/curated-lists-icon1.png'),
          blackBorder: true
        },
        {
          id: 1,
          name: 'Ape Szn',
          icon: require('@/assets/images/curated-lists-icon2.jpg'),
          blackBorder: false
        },
        {
          id: 2,
          name: 'Comfy list',
          icon: require('@/assets/images/curated-lists-icon3.png'),
          blackBorder: true
        },
        {
          id: 3,
          name: 'Powerlist',
          icon: require('@/assets/images/curated-lists-icon4.jpg'),
          blackBorder: false
        }
      ];

      return new Promise((resolve) => {
        setTimeout(() => {
          commit('setLoadingCuratedListPromise', Promise.resolve(localEntries));
          commit('setCuratedList', localEntries);
          commit('setLoadingCuratedListPromise', undefined);
          commit('setIsLoadingCuratedList', false);
          resolve(localEntries);
        }, 1500);
      });
    }
  };

export type ActionType = typeof actions;
export default actions;
