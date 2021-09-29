import { ActionTree } from 'vuex';
import * as Sentry from '@sentry/vue';
import { RootStoreState } from '@/store/types';
import {
  CreateProposalPayload,
  LoadProposalInfoPayload,
  LoadScoresPayload,
  ProposalStoreState
} from './types';
import {
  getProposal,
  getProposalsList,
  ProposalWithVotes,
  vote,
  VoteParams,
  getScores,
  getSpace,
  createProposal,
  getCommunityVotingPower,
  getVotingPower
} from '@/services/mover/governance';
import { isValidCacheItem } from './utils';
import {
  CreateProposalParams,
  ProposalInfo,
  Scores
} from '@/services/mover/governance';
import dayjs from 'dayjs';
import { sameAddress } from '@/utils/address';

export default {
  async loadGovernanceInfo(
    { state, commit, dispatch },
    refetch = false
  ): Promise<Array<ProposalWithVotes>> {
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
      commit('setLoadingPromise', proposalsListPromise);

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
      commit('setIsLoading', false);
      return results.filter(
        (res) => res !== undefined
      ) as Array<ProposalWithVotes>;
    } catch (error) {
      Sentry.captureException(error);
      commit('setLoadingPromise', undefined);
      commit('setError', error);
      commit('setIsLoading', false);
      return [];
    }
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

      const commuintyVotingPowerPromise = getCommunityVotingPower(
        Number.parseInt(proposalWithVotes.proposal.snapshot)
      );

      const [scoresAll, scoresSelf, communityVotingPower] = await Promise.all([
        scoresAllPromise,
        scoresSelfPromise,
        commuintyVotingPowerPromise
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
    { state, rootState },
    { title, description, metadata = {} }: CreateProposalPayload
  ): Promise<void> {
    try {
      if (
        rootState.account?.provider?.web3 === undefined ||
        rootState.account?.currentAddress === undefined
      ) {
        throw new Error('failed to get web3 provider or current address');
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
  async vote({ state, rootState }, payload: VoteParams): Promise<void> {
    try {
      if (
        rootState.account?.provider?.web3 === undefined ||
        rootState.account.currentAddress === undefined
      ) {
        throw new Error('failed to get web3 provider or current address');
      }

      if (
        state.items.some((info) =>
          info.votes.some((vote) =>
            sameAddress(vote.voter, rootState.account?.currentAddress)
          )
        )
      ) {
        throw new Error('already voted');
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
      const scores = getScores(
        state.spaceId,
        proposal.strategies,
        proposal.network,
        addresses,
        snapshot
      );

      return scores;
    } catch (error) {
      Sentry.captureException(error);
      return new Array(proposal.strategies.length).fill({});
    }
  },
  async loadPowerInfo({ state, commit, dispatch }): Promise<void> {
    try {
      const spaceInfoPromise = getSpace(state.spaceId);
      const votingPowerPromise = getCommunityVotingPower();
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
  async loadVotingPowerSelf({ commit, rootState }): Promise<number> {
    try {
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
