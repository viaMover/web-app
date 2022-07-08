import {
  CreateProposalParams,
  CreateProposalResponse,
  CurrentVotingInfo,
  MoverAPIGovernanceService,
  ProposalInfo,
  VoteResponse
} from '@/services/v2/api/mover/governance';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import { GovernanceStoreState, VoteParams } from './types';

type Actions = {
  loadLastProposalInfo: Promise<ProposalInfo | undefined>;
  loadProposalInfoList: Promise<Array<ProposalInfo>>;
  loadProposalInfoById: Promise<ProposalInfo | undefined>;

  loadCurrentVotingInfo: Promise<CurrentVotingInfo>;

  createProposal: Promise<CreateProposalResponse>;
  vote: Promise<VoteResponse>;
  getOrCreateService: MoverAPIGovernanceService;
};

const actions: ActionFuncs<
  Actions,
  GovernanceStoreState,
  MutationType,
  GetterType
> = {
  async loadLastProposalInfo({
    state,
    commit,
    dispatch
  }): Promise<ProposalInfo> {
    // serve debounced if present
    if (
      state.isLoadingLastProposalInfo &&
      state.lastProposalInfoPromise !== undefined
    ) {
      return state.lastProposalInfoPromise;
    }

    // serve from debounced full list if present
    if (
      state.isLoadingProposalInfoList &&
      state.proposalInfoListPromise !== undefined
    ) {
      return state.proposalInfoListPromise
        .then((list) => {
          const sortedDesc = list
            .slice()
            .sort((a, b) => b.proposal.endTs - a.proposal.endTs);
          if (sortedDesc.length > 0) {
            return sortedDesc[0];
          }

          return undefined;
        })
        .catch(() => dispatch('loadLastProposalInfo'));
    }

    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );

    const load = async () => {
      try {
        commit('setIsLoadingLastProposalInfo', true);

        const promise = service.getLastProposal();

        const lastProposal = await promise;
        commit('upsertProposalInfoList', lastProposal);
        return lastProposal;
      } finally {
        commit('setIsLoadingLastProposalInfo', false);
        commit('setLastProposalInfoPromise', undefined);
      }
    };

    const promise = load();
    commit('setLastProposalInfoPromise', promise);
    return promise;
  },
  async loadProposalInfoList({
    state,
    commit,
    dispatch
  }): Promise<Array<ProposalInfo>> {
    // serve debounced if present
    if (
      state.isLoadingProposalInfoList &&
      state.proposalInfoListPromise !== undefined
    ) {
      return state.proposalInfoListPromise;
    }

    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );

    const load = async () => {
      try {
        commit('setIsLoadingProposalInfoList', true);

        const promise = service.getProposalList();

        const lastProposal = await promise;
        commit('upsertProposalInfoList', lastProposal);
        return lastProposal;
      } finally {
        commit('setIsLoadingProposalInfoList', false);
        commit('setProposalInfoListPromise', undefined);
      }
    };

    const promise = load();
    commit('setProposalInfoListPromise', promise);
    return promise;
  },
  async loadCurrentVotingInfo({
    state,
    commit,
    dispatch
  }): Promise<CurrentVotingInfo> {
    // serve debounced if present
    if (state.currentVotingInfoPromise !== undefined) {
      return state.currentVotingInfoPromise;
    }

    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );

    const load = async () => {
      try {
        return await service.getCurrentVotingInfo();
      } catch (error) {
        // if at least has a valid old state, use it
        if (
          state.currentVotingInfo.votingPower > 0 &&
          state.currentVotingInfo.communityVotingPower > 0 &&
          state.currentVotingInfo.minimalVotingPower > 0
        ) {
          return state.currentVotingInfo;
        }

        throw error;
      }
    };

    const promise = load();
    commit('setCurrentVotingInfoPromise', promise);
    return promise;
  },
  async loadProposalInfoById(
    { commit, dispatch },
    id: string
  ): Promise<ProposalInfo | undefined> {
    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );

    const proposalInfo = service.getProposalById(id);
    commit('upsertProposalInfoList', proposalInfo);
    return proposalInfo;
  },
  async createProposal(
    { dispatch },
    template: CreateProposalParams
  ): Promise<CreateProposalResponse> {
    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );
    return service.createProposal(template);
  },
  async vote({ dispatch }, params: VoteParams): Promise<VoteResponse> {
    const service: MoverAPIGovernanceService = await dispatch(
      'getOrCreateService'
    );
    return service.vote(params.proposalId, params.choice);
  },
  getOrCreateService({ commit, state, rootState }): MoverAPIGovernanceService {
    if (state.service !== undefined) {
      return state.service;
    }

    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('Account state is not ready');
    }

    const service = new MoverAPIGovernanceService(
      rootState.account.currentAddress,
      rootState.account.provider.web3
    );
    commit('setService', service);
    return service;
  }
};

export type ActionType = typeof actions;
export default actions;
