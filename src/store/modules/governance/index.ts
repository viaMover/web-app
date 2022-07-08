import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { GovernanceStoreState } from './types';

const initialState: GovernanceStoreState = {
  isLoadingLastProposalInfo: false,
  lastProposalInfoPromise: undefined,

  isLoadingProposalInfoList: false,
  proposalInfoListPromise: undefined,
  proposalInfoList: [],

  currentVotingInfo: {
    minimalVotingPower: 0,
    votingPower: 0,
    communityVotingPower: 0
  },
  currentVotingInfoPromise: undefined,

  service: undefined
};

export default {
  namespaced: true,
  strict: !isProduction(),
  state: () => initialState,
  actions,
  getters,
  mutations
} as AugmentedModule<
  GovernanceStoreState,
  ActionType,
  GetterType,
  MutationType
>;
