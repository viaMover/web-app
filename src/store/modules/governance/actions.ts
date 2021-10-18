import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';

import {
  getCommunityVotingPower as getCommunityVotingPowerFromChain,
  getVotingPower as getVotingPowerSelfFromChain
} from '@/services/chain';
import { getBlockNumberByUnixTs as getBlockNumberByUnixTsEtherscan } from '@/services/etherscan/block-number';
import { getBlockNumber as getBlockNumberInfura } from '@/services/infura/block-number';
import {
  createProposal,
  CreateProposalParams,
  CreateProposalResponse,
  getCommunityVotingPower,
  getLastProposalId,
  getProposal,
  getProposalIdsList,
  getScores,
  getSpace,
  getVotingPower,
  GovernanceApiError,
  ProposalInfo,
  ProposalWithVotes,
  Scores,
  vote,
  VoteParams,
  VoteResponse
} from '@/services/mover/governance';
import { RootStoreState } from '@/store/types';
import { fromWei } from '@/utils/bigmath';

import {
  CreateProposalPayload,
  GovernanceStoreState,
  LoadProposalInfoPayload,
  LoadScoresPayload
} from './types';
import { isValidCacheItem } from './utils';

export default {
  async loadMinimalGovernanceInfo(
    { commit, dispatch, state, getters },
    refetch = false
  ): Promise<ProposalInfo | undefined> {
    try {
      commit('setIsLoadingLastProposal', true);

      try {
        if (!refetch && (state.isLoading || state.loadingPromise)) {
          await state.loadingPromise;

          commit('setIsLoadingLastProposal', false);
          return getters.lastProposal;
        }
      } catch (moduleLoadingError) {
        return dispatch('loadLastProposalMinimal', true);
      }

      let spaceInfoPromise = Promise.resolve(state.spaceInfo);
      if (state.spaceInfo === undefined) {
        spaceInfoPromise = dispatch('loadPowerInfo');
      }

      const resultPromise = dispatch('loadProposalInfo', {
        id: await getLastProposalId(),
        refetch
      });

      const [result] = await Promise.all([resultPromise, spaceInfoPromise]);

      commit('setIsLoadingLastProposal', false);
      return result;
    } catch (error) {
      console.error('failed to get minimal info', error);
      Sentry.captureException(error);
      commit('setIsLoadingLastProposal', false);
      return undefined;
    }
  },
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
        // initial load, refetch or previous fetch failure
        if (refetch || state.items.length < 1) {
          commit('clearItems');
        }

        // initial load, refetch or previous fetch failure
        if (refetch || state.spaceInfo === undefined) {
          commit('setSpaceInfo', undefined);
        }

        commit('setError', undefined);
        commit('setLoadingPromise', undefined);

        const proposalsListPromise = getProposalIdsList(state.spaceId);
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
        console.error('failed to get info', error);
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
        scoresSelfPromise = scoresSelfPromise
          .then(async () =>
            dispatch('loadScores', {
              proposal: proposalWithVotes.proposal,
              addresses: [rootState.account?.currentAddress],
              snapshot: Number.parseInt(proposalWithVotes.proposal.snapshot)
            } as LoadScoresPayload)
          )
          .catch(async (error) => {
            console.warn(
              'failed to get self scores, using fallback scenario',
              error
            );
            Sentry.captureException(error);

            if (proposalWithVotes.proposal.strategies.length < 1) {
              return [];
            }

            const votingPowerSelf = await dispatch(
              'loadVotingPowerSelfAtSnapshot',
              Number.parseInt(proposalWithVotes.proposal.snapshot)
            );

            const res = new Array(
              proposalWithVotes.proposal.strategies.length
            ).fill({});
            res[0] = {
              [rootState.account?.currentAddress ?? 'missing_address']:
                Number.parseFloat(votingPowerSelf)
            };
          });
      }

      const communityVotingPowerPromise = dispatch(
        'loadCommunityVotingPower',
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
      } as ProposalInfo;

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
      console.error('failed to get single proposal', error);

      Sentry.captureException(error);
      return undefined;
    }
  },
  async createProposal(
    { state, rootState, getters },
    { title, description, metadata = {} }: CreateProposalPayload
  ): Promise<CreateProposalResponse> {
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

      return await createProposal(
        rootState.account.provider.web3,
        rootState.account.currentAddress,
        state.spaceId,
        params
      );
    } catch (error) {
      console.error('failed to create a proposal', error);

      Sentry.captureException(error);
      throw error;
    }
  },
  async vote(
    { state, rootState, getters },
    payload: VoteParams
  ): Promise<VoteResponse> {
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

      return await vote(
        rootState.account.provider.web3,
        rootState.account.currentAddress,
        state.spaceId,
        payload
      );
    } catch (error) {
      console.error('failed to vote', error);

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
      console.error('failed to load scores', error);
      Sentry.captureException(error);
      return new Array(proposal.strategies.length).fill({});
    }
  },
  async loadPowerInfo({ state, commit, dispatch }): Promise<void> {
    try {
      // resolve with existing spaceInfo or fetch the new one
      const spaceInfoPromise = state.spaceInfo
        ? Promise.resolve(state.spaceInfo)
        : getSpace(state.spaceId);

      // current community voting power
      const votingPowerPromise = dispatch('loadCommunityVotingPower');

      // current self voting power
      const votingPowerSelfPromise = dispatch('loadCurrentVotingPowerSelf');

      const [spaceInfo, communityVotingPower] = await Promise.all([
        spaceInfoPromise,
        votingPowerPromise,
        votingPowerSelfPromise
      ]);

      commit('setSpaceInfo', spaceInfo);
      commit('setPowerNeededToBecomeAProposer', spaceInfo.filters.minScore);
      commit('setCommunityVotingPower', communityVotingPower);
    } catch (error) {
      console.error('failed to load power info', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  async loadCommunityVotingPower(
    { dispatch, rootState },
    snapshot?: number
  ): Promise<string> {
    try {
      const blockNumber: number =
        snapshot !== undefined ? snapshot : await dispatch('getBlockNumber');

      const communityVotingPowerInWei = await getCommunityVotingPower(
        blockNumber
      );
      if (communityVotingPowerInWei.isError) {
        throw new Error(communityVotingPowerInWei.error);
      }

      return fromWei(communityVotingPowerInWei.result.votingPower, 18);
    } catch (error) {
      console.warn(
        'failed to load communityVotingPower, trying a fallback',
        error
      );
      Sentry.captureException(error);
      Sentry.addBreadcrumb({
        message: 'trying to use fallback community voting power scenario'
      });

      try {
        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        if (rootState.account?.networkInfo === undefined) {
          throw new Error('failed to get network info');
        }

        if (rootState.account?.provider?.web3 === undefined) {
          throw new Error('failed to get web3 provider');
        }

        return await getCommunityVotingPowerFromChain(
          rootState.account.currentAddress,
          rootState.account.networkInfo.network,
          rootState.account.provider.web3,
          snapshot
        );
      } catch (fallbackError) {
        console.error('failed to load communityVotingPower', fallbackError);
        Sentry.captureException(fallbackError);
        throw fallbackError;
      }
    }
  },
  async loadVotingPowerSelfAtSnapshot(
    { dispatch, state, rootState },
    snapshot?: number
  ): Promise<string> {
    // no need for an extra cache as consumers know how to treat
    // results with persistence
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      const blockNumber: number =
        snapshot !== undefined ? snapshot : await dispatch('getBlockNumber');

      const votingPowerSelfInWei = await getVotingPower(
        rootState.account.currentAddress,
        blockNumber
      );

      if (votingPowerSelfInWei.isError) {
        throw new Error(votingPowerSelfInWei.error);
      }

      const votingPower = fromWei(votingPowerSelfInWei.result.votingPower, 18);

      return votingPower;
    } catch (error) {
      console.warn(
        'failed to load self voting power, trying a votehub fallback',
        error
      );
      Sentry.captureException(error);
      Sentry.addBreadcrumb({
        message: 'trying to use fallback self voting power votehub api scenario'
      });

      try {
        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        let spaceInfo = state.spaceInfo;
        if (spaceInfo === undefined) {
          // if spaceInfo is not ready yet
          spaceInfo = await getSpace(state.spaceId);
        }

        const scoreSnapshot: number | string =
          snapshot !== undefined ? snapshot : 'latest';

        const scores = await getScores(
          state.spaceId,
          spaceInfo.strategies,
          spaceInfo.network,
          [rootState.account.currentAddress],
          scoreSnapshot
        );

        const votingPowerSelf = scores
          .reduce((acc, score) => {
            return (
              acc +
              (score[rootState.account?.currentAddress ?? 'missing_address'] ??
                0)
            );
          }, 0)
          .toString();

        return votingPowerSelf;
      } catch (fallbackErrorVoteApi) {
        console.warn(
          'failed to load self voting power from votehub api, trying a fallback',
          fallbackErrorVoteApi
        );
        Sentry.captureException(error);
        Sentry.addBreadcrumb({
          message: 'trying to use fallback self voting power on-chain scenario'
        });

        try {
          if (rootState.account?.currentAddress === undefined) {
            throw new Error('failed to get current address');
          }

          if (rootState.account?.networkInfo?.network === undefined) {
            throw new Error('failed to get network info');
          }

          if (rootState.account?.provider?.web3 === undefined) {
            throw new Error('failed to get web3 provider');
          }

          const votingPowerSelf = await getVotingPowerSelfFromChain(
            rootState.account.currentAddress,
            rootState.account.networkInfo.network,
            rootState.account.provider.web3,
            snapshot
          );

          return votingPowerSelf;
        } catch (fallbackErrorOnChain) {
          console.error(
            'failed to load self voting power',
            fallbackErrorOnChain
          );
          Sentry.captureException(fallbackErrorOnChain);
          throw fallbackErrorOnChain;
        }
      }
    }
  },
  async loadCurrentVotingPowerSelf(
    { commit, dispatch, state },
    refetch = false
  ): Promise<string> {
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

    const votingPowerSelf = await dispatch(
      'loadVotingPowerSelfAtSnapshot',
      undefined
    );
    commit('setVotingPowerSelf', votingPowerSelf);

    return votingPowerSelf;
  },
  async getBlockNumber({ state, commit, rootState }): Promise<number> {
    try {
      if (
        isValidCacheItem(state.cacheGenericInfoMap, 'blockNumber', 5) &&
        state.blockNumberCached !== undefined
      ) {
        return state.blockNumberCached;
      }

      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      const res: unknown =
        await rootState.account.provider.web3.eth.getBlockNumber();
      if (typeof res !== 'number') {
        // for some reason sometimes provider returns not a number
        // but rather some other null-ish value (or an error pehaps)
        //
        // so we try to avoid using this invalid value and use a fallback
        // method instead
        throw new Error('failed to get a valid answer from web3');
      }

      commit('setBlockNumberCached', res);

      return res;
    } catch (error) {
      console.warn(
        'failed to get blockNumber, trying an etherscan fallback',
        error
      );
      Sentry.captureException(error);
      Sentry.addBreadcrumb({
        message: 'trying to use fallback blockNumber etherscan scenario'
      });

      try {
        if (rootState.account?.networkInfo?.network === undefined) {
          throw new Error('failed to get network info');
        }

        const nowTs = dayjs().unix();
        const result = await getBlockNumberByUnixTsEtherscan(
          nowTs,
          rootState.account.networkInfo.network
        );
        if (result.isError) {
          throw new Error(result.error);
        }

        commit('setBlockNumberCached', result.result);

        return result.result;
      } catch (fallbackErrorEtherscan) {
        console.warn(
          'failed to get blockNumber from etherscan, trying an infura fallback',
          fallbackErrorEtherscan
        );
        Sentry.addBreadcrumb({
          message: 'trying to use fallback blockNumber infura scenario'
        });
        Sentry.captureException(fallbackErrorEtherscan);

        try {
          if (rootState.account?.networkInfo?.network === undefined) {
            throw new Error('failed to get network info');
          }

          const result = await getBlockNumberInfura(
            rootState.account.networkInfo.network
          );
          if (result.isError) {
            throw new Error(result.error);
          }

          commit('setBlockNumberCached', result.result);

          return result.result;
        } catch (fallbackErrorInfura) {
          if (state.blockNumberCached === undefined) {
            console.error(
              'failed to get blockNumber',
              fallbackErrorInfura,
              'no cached value available'
            );
            Sentry.captureException(fallbackErrorInfura);
            throw fallbackErrorInfura;
          }

          console.warn(
            'failed to get blockNumber',
            fallbackErrorInfura,
            'using cached blockNumber as a last fallback',
            state.blockNumberCached
          );
          Sentry.captureException(fallbackErrorInfura);
          return state.blockNumberCached;
        }
      }
    }
  }
} as ActionTree<GovernanceStoreState, RootStoreState>;
