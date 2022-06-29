import { MoverAPITagService } from '@/services/v2/api/mover/tag';
import { MutationFuncs } from '@/store/types';

import { TagStoreState } from './types';

type Mutations = {
  setTag: void;
  setIsLoading: void;
  setIsBannerVisible: void;
  toggleIsBannerVisible: void;
  setAPIService: void;
};

const mutations: MutationFuncs<Mutations, TagStoreState> = {
  setTag(state, tag: string | undefined): void {
    state.tag = tag;
  },
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setIsBannerVisible(state, isVisible: boolean): void {
    state.isBannerVisible = isVisible;
  },
  toggleIsBannerVisible(state): void {
    state.isBannerVisible = !state.isBannerVisible;
  },
  setAPIService(state, service: MoverAPITagService | undefined): void {
    state.apiService = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
