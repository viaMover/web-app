import { ActionTree } from 'vuex';
import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';

import { RootStoreState } from '@/store/types';
import {
  createProposal,
  CreateProposalParams,
  getCommunityVotingPower,
  getProposal,
  getProposalsList,
  getScores,
  getSpace,
  getVotingPower,
  GovernanceApiError,
  ProposalInfo,
  ProposalWithVotes,
  Scores,
  vote,
  VoteParams
} from '@/services/mover/governance';

import {
  CreateProposalPayload,
  LoadProposalInfoPayload,
  LoadScoresPayload,
  ProposalStoreState
} from './types';
import { isValidCacheItem } from './utils';

export default {
  async loadGovernanceInfo(
    { state, commit, dispatch },
    refetch = false
  ): Promise<Array<ProposalWithVotes>> {
    const load = async () => {
      try {
        if (state.loadingPromise !== undefined && !refetch) {
          return state.loadingPromise;
        }

        commit('setIsLoading', true);
        commit('clearItems');
        commit('setSpaceInfo', undefined);
        commit('setError', undefined);
        commit('setLoadingPromise', undefined);

        const proposalsListPromise = getProposalsList(state.spaceId);
        const powerInfoPromise = dispatch('loadPowerInfo');

        const [proposalIds] = await Promise.all([
          proposalsListPromise,
          powerInfoPromise
        ]);
        const results = await Promise.all(
          proposalIds.map(
            async (id: string): Promise<ProposalInfo | undefined> =>
              dispatch('loadProposalInfo', { id, refetch })
          )
        );

        const result = results.filter(
          (res) => res !== undefined
        ) as Array<ProposalInfo>;

        commit('setIsLoading', false);
        return result;
      } catch (error) {
        Sentry.captureException(error);
        commit('setError', error);
        commit('setIsLoading', false);
        return [];
      }
    };

    const info = load();
    commit('setLoadingPromise', info);

    return info;
  },
  async loadProposalInfo(
    { state, commit, dispatch, rootState },
    { id, refetch = false }: LoadProposalInfoPayload
  ): Promise<ProposalInfo | undefined> {
    const loadFreshData = async (): Promise<ProposalInfo | undefined> => {
      const proposalWithVotes = await getProposal(id);
      if (proposalWithVotes.proposal == null) {
        return undefined;
      }

      const scoresAllPromise = dispatch('loadScores', {
        proposal: proposalWithVotes.proposal,
        addresses: proposalWithVotes.votes.map((vote) => vote.voter),
        snapshot: Number.parseInt(proposalWithVotes.proposal.snapshot)
      } as LoadScoresPayload);

      let scoresSelfPromise = Promise.resolve(
        new Array(proposalWithVotes.proposal.strategies.length).fill({})
      );
      if (rootState.account?.currentAddress !== undefined) {
        scoresSelfPromise = scoresSelfPromise.then(() =>
          dispatch('loadScores', {
            proposal: proposalWithVotes.proposal,
            addresses: [rootState.account?.currentAddress],
            snapshot: Number.parseInt(proposalWithVotes.proposal.snapshot)
          } as LoadScoresPayload)
        );
      }

      const communityVotingPowerPromise = getCommunityVotingPower(
        Number.parseInt(proposalWithVotes.proposal.snapshot)
      );

      const [scoresAll, scoresSelf, communityVotingPower] = await Promise.all([
        scoresAllPromise,
        scoresSelfPromise,
        communityVotingPowerPromise
      ]);

      const newItem = {
        proposal: proposalWithVotes.proposal,
        votes: proposalWithVotes.votes,
        scores: {
          all: scoresAll,
          self: scoresSelf
        },
        communityVotingPower
      };

      commit('upsertItems', newItem);

      return newItem;
    };

    try {
      if (refetch) {
        return await loadFreshData();
      }

      const existingItemIdx = state.items.findIndex(
        (item) => item.proposal.id === id
      );

      if (existingItemIdx < 0) {
        return await loadFreshData();
      }

      if (!isValidCacheItem(state.cacheInfoMap, id, state.cachePeriodSeconds)) {
        return await loadFreshData();
      }

      return state.items[existingItemIdx];
    } catch (error) {
      Sentry.captureException(error);
      return undefined;
    }
  },
  async createProposal(
    { state, rootState, getters },
    { title, description, metadata = {} }: CreateProposalPayload
  ): Promise<void> {
    try {
      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (!getters.hasEnoughVotingPowerToBecomeAProposer) {
        throw new GovernanceApiError('not enough power to create a proposal');
      }

      const now = dayjs();
      const blockNumber =
        await rootState.account.provider.web3.eth.getBlockNumber();

      const params: CreateProposalParams = {
        name: title,
        body: description,
        choices: ['for', 'against'],
        start: now.unix(),
        end: now.add(state.proposalDurationDays, 'days').unix(),
        snapshot: blockNumber,
        metadata
      };

      await createProposal(
        rootState.account.provider.web3,
        rootState.account.currentAddress,
        state.spaceId,
        params
      );
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  },
  async vote(
    { state, rootState, getters },
    payload: VoteParams
  ): Promise<void> {
    try {
      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (getters.isAlreadyVoted(payload.proposal)) {
        throw new GovernanceApiError('already voted');
      }

      if (!getters.hasEnoughVotingPowerToVote(payload.proposal)) {
        throw new GovernanceApiError('not enough power to vote');
      }

      await vote(
        rootState.account.provider.web3,
        rootState.account.currentAddress,
        state.spaceId,
        payload
      );
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  },
  async loadScores(
    { state },
    { proposal, addresses, snapshot = 'latest' }: LoadScoresPayload
  ): Promise<Scores> {
    try {
      return getScores(
        state.spaceId,
        proposal.strategies,
        proposal.network,
        addresses,
        snapshot
      );
    } catch (error) {
      Sentry.captureException(error);
      return new Array(proposal.strategies.length).fill({});
    }
  },
  async loadPowerInfo({ state, commit, dispatch }): Promise<void> {
    try {
      const spaceInfoPromise = getSpace(state.spaceId);

      // current community voting power
      const votingPowerPromise = getCommunityVotingPower();

      // current self voting power
      const votingPowerSelfPromise = dispatch('loadVotingPowerSelf');

      const [spaceInfo, votingPower] = await Promise.all([
        spaceInfoPromise,
        votingPowerPromise,
        votingPowerSelfPromise
      ]);

      commit('setSpaceInfo', spaceInfo);
      commit('setPowerNeededToBecomeAProposer', spaceInfo.filters.minScore);
      commit('setCommunityVotingPower', votingPower);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  },
  async loadVotingPowerSelf(
    { commit, state, rootState },
    refetch = false
  ): Promise<number> {
    try {
      if (
        !refetch &&
        isValidCacheItem(
          state.cacheGenericInfoMap,
          'votingPowerSelf',
          state.cachePeriodSeconds
        )
      ) {
        return state.votingPowerSelf;
      }

      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      const votingPowerSelf = await getVotingPower(
        rootState.account.currentAddress
      );
      commit('setVotingPowerSelf', votingPowerSelf);

      return votingPowerSelf;
    } catch (error) {
      Sentry.captureException(error);
      return 0;
    }
  }
} as ActionTree<ProposalStoreState, RootStoreState>;
