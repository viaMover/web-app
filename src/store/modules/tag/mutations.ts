import { MoverAPITagService } from '@/services/v2/api/mover/tag';
import { MutationFuncs } from '@/store/types';

import { SetTagAndSigArgs, TagStoreState } from './types';

type Mutations = {
  setTagAndSig: void;
  setIsLoading: void;
  setIsBannerVisible: void;
  toggleIsBannerVisible: void;
  setAPIService: void;
};

const mutations: MutationFuncs<Mutations, TagStoreState> = {
  setTagAndSig(state, { tag, sig }: SetTagAndSigArgs): void {
    state.tag = tag;
    state.sig = sig;
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
