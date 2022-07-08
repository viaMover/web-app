import {
  CurrentVotingInfo,
  MoverAPIGovernanceService,
  ProposalInfo
} from '@/services/v2/api/mover/governance';
import { MutationFuncs } from '@/store/types';

import { GovernanceStoreState } from './types';

type Mutations = {
  setIsLoadingLastProposalInfo: void;
  setLastProposalInfoPromise: void;
  setIsLoadingProposalInfoList: void;
  setProposalInfoListPromise: void;
  setProposalInfoList: void;
  upsertProposalInfoList: void;
  setCurrentVotingInfo: void;
  setCurrentVotingInfoPromise: void;
  setService: void;
};

const mutations: MutationFuncs<Mutations, GovernanceStoreState> = {
  setIsLoadingLastProposalInfo(state, isLoading: boolean) {
    state.isLoadingLastProposalInfo = isLoading;
  },
  setLastProposalInfoPromise(
    state,
    promise: Promise<ProposalInfo> | undefined
  ) {
    state.lastProposalInfoPromise = promise;
  },
  setIsLoadingProposalInfoList(state, isLoading: boolean) {
    state.isLoadingProposalInfoList = isLoading;
  },
  setProposalInfoListPromise(
    state,
    promise: Promise<Array<ProposalInfo>> | undefined
  ) {
    state.proposalInfoListPromise = promise;
  },
  setProposalInfoList(state, list: Array<ProposalInfo>) {
    state.proposalInfoList = list;
  },
  upsertProposalInfoList(state, newVal: ProposalInfo) {
    const slice = state.proposalInfoList.slice();
    const replaceIndex = slice.findIndex(
      (oldVal) => oldVal.proposal.id === newVal.proposal.id
    );
    if (replaceIndex < 0) {
      slice.push(newVal);
    } else {
      slice.splice(replaceIndex, 1, newVal);
    }

    state.proposalInfoList = slice;
  },
  setCurrentVotingInfo(state, info: CurrentVotingInfo) {
    state.currentVotingInfo = info;
  },
  setCurrentVotingInfoPromise(
    state,
    promise: Promise<CurrentVotingInfo> | undefined
  ) {
    state.currentVotingInfoPromise = promise;
  },
  setService(state, service: MoverAPIGovernanceService) {
    state.service = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
