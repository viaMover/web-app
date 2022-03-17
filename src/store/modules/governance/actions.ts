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
  Scores,
  vote,
  VoteParams,
  VoteResponse
} from '@/services/mover/governance';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';
import { fromWei } from '@/utils/bigmath';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  CreateProposalPayload,
  GovernanceStoreState,
  LoadScoresPayload,
  LoadScoresSelfPayload
} from './types';

// 60 sec
export const ACTIVE_PROPOSAL_TIME_EXPIRE = 60 * 1000;
// 1 week
export const CLOSED_PROPOSAL_TIME_EXPIRE = 7 * 24 * 60 * 60 * 1000;
// 60 sec
export const VOTING_POWER_SELF_EXPIRE_TIME = 60 * 1000;
// 5 min
export const COMMUNITY_VOTING_POWER_EXPIRE_TIME = 5 * 60 * 1000;
// 5 sec
export const BLOCK_NUMBER_EXPIRE_TIME = 5 * 1000;
//1 week
export const SPACE_INFO_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000;

type Actions = {
  restorePersist: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  loadProposalInfo: Promise<ProposalInfo | undefined>;
  createProposal: Promise<CreateProposalResponse>;
  vote: Promise<VoteResponse>;
  loadScoresSelf: Promise<Array<Scores>>;
  loadScores: Promise<Scores>;
  loadPowerInfo: Promise<void>;
  loadCommunityVotingPower: Promise<string>;
  loadVotingPowerSelfAtSnapshot: Promise<string>;
  loadCurrentVotingPowerSelf: Promise<string>;
  getBlockNumber: Promise<number>;
};

const actions: ActionFuncs<
  Actions,
  GovernanceStoreState,
  MutationType,
  GetterType
> = {
  async restorePersist({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }
    let info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'governance-power',
      'community'
    );
    if (info !== undefined) {
      commit('setCommunityVotingPower', info);
    }

    info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'governance-space',
      'info'
    );
    if (info !== undefined) {
      commit('setSpaceInfo', info);
    }
  },
  async loadMinimalInfo({ commit, dispatch, getters }): Promise<void> {
    try {
      commit('setIsLoadingMinimal', true);

      if (getters.lastProposal !== undefined) {
        commit('setIsLoadingMinimal', false);
        return;
      }

      if (getters.spaceInfo === undefined) {
        await dispatch('loadPowerInfo');
      }

      if (getters.lastProposal === undefined) {
        await dispatch('loadProposalInfo', await getLastProposalId());
      }

      commit('setIsLoadingMinimal', false);
    } catch (error) {
      console.error('failed to get minimal info', error);
      Sentry.captureException(error);
      commit('setIsLoadingMinimal', false);
    }
  },
  async loadInfo({ state, commit, dispatch }): Promise<void> {
    try {
      commit('setIsLoading', true);

      await dispatch('restorePersist');

      const proposalsListPromise = getProposalIdsList(state.spaceId);
      const powerInfoPromise = dispatch('loadPowerInfo');

      const [proposalIds] = await Promise.all([
        proposalsListPromise,
        powerInfoPromise
      ]);

      const promisesResults = await Promise.allSettled(
        proposalIds.map(
          async (id: string): Promise<ProposalInfo | undefined> =>
            dispatch('loadProposalInfo', id)
        )
      );

      const promisesErrors = promisesResults
        .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
        .map((p) => p.reason);

      if (promisesErrors.length > 0) {
        console.warn('failed to load Proposal info', promisesErrors);
        Sentry.captureException(promisesErrors);
      }

      commit('setIsLoading', false);
    } catch (error) {
      console.error('failed to get info', error);
      Sentry.captureException(error);
      commit('setIsLoading', false);
    }
  },
  async loadProposalInfo(
    { commit, rootState, dispatch, getters },
    id: string
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

      const scoresSelfPromise = dispatch('loadScoresSelf', {
        proposal: proposalWithVotes.proposal,
        snapshot: Number.parseInt(proposalWithVotes.proposal.snapshot)
      } as LoadScoresSelfPayload);

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

      if (
        ensureAccountStateIsSafe(rootState.account) &&
        newItem.proposal.state === 'closed'
      ) {
        setToPersistStore(
          rootState.account.currentAddress,
          'governance-proposal',
          id,
          newItem,
          CLOSED_PROPOSAL_TIME_EXPIRE
        );
      }

      return newItem;
    };

    try {
      let prop = getters.proposal(id);
      if (prop !== undefined) {
        return prop;
      }

      if (ensureAccountStateIsSafe(rootState.account)) {
        prop = await getFromPersistStoreWithExpire(
          rootState.account.currentAddress,
          'governance-proposal',
          id
        );
        if (prop !== undefined) {
          commit('upsertItems', prop);
          return prop;
        }
      }

      return await loadFreshData();
    } catch (error) {
      console.error('failed to get single proposal', error);

      Sentry.captureException(error);
      return undefined;
    }
  },
  async createProposal(
    { state, dispatch, rootState, getters },
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
      const blockNumber: number = await dispatch('getBlockNumber');

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
    { state, commit, rootState, getters },
    payload: VoteParams
  ): Promise<VoteResponse> {
    try {
      if (!ensureAccountStateIsSafe(rootState.account)) {
        throw new Error('account not ready');
      }

      const storedProposal = getters.proposal(payload.proposalId);
      if (storedProposal === undefined) {
        // although should not happen, TypeScript doesn't know
        // anything about that so throw an error like 'never' :)
        throw new Error('failed to find stored proposal');
      }

      const now = dayjs().unix();

      if (now < storedProposal.proposal.start) {
        throw new GovernanceApiError('voting is not started yet');
      }

      if (now > storedProposal.proposal.end) {
        throw new GovernanceApiError('voting is closed');
      }

      if (getters.isAlreadyVoted(payload.proposalId)) {
        throw new GovernanceApiError('already voted');
      }

      if (!getters.hasEnoughVotingPowerToVote(payload.proposalId)) {
        throw new GovernanceApiError('not enough power to vote');
      }

      const result = await vote(
        rootState.account.provider.web3,
        rootState.account.currentAddress,
        state.spaceId,
        payload
      );

      // manually add vote record in case of
      // subsequent refetch request fails
      const newItem = {
        ...storedProposal,
        votes: storedProposal.votes.concat({
          choice: payload.choice,
          created: now,
          id: result.id,
          ipfs: result.ipfsHash,
          voter: rootState.account.currentAddress
        }),
        scores: {
          ...storedProposal.scores,
          all: storedProposal.scores.all.map((scoresGroup) => ({
            ...scoresGroup,
            [rootState.account?.currentAddress ?? 'missing_address']:
              state.votingPowerSelf
          }))
        }
      } as ProposalInfo;
      commit('upsertItems', newItem);

      if (newItem.proposal.state === 'closed') {
        setToPersistStore(
          rootState.account.currentAddress,
          'governance-proposal',
          payload.proposalId,
          newItem,
          CLOSED_PROPOSAL_TIME_EXPIRE
        );
      }

      return result;
    } catch (error) {
      console.error('failed to vote', error);

      Sentry.captureException(error);
      throw error;
    }
  },
  async loadScoresSelf(
    { dispatch, rootState },
    { proposal, snapshot = 'latest' }: LoadScoresSelfPayload
  ): Promise<Array<Scores>> {
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      return await dispatch('loadScores', {
        proposal,
        addresses: [rootState.account.currentAddress],
        snapshot
      } as LoadScoresPayload);
    } catch (error) {
      console.warn('failed to get self scores, using fallback scenario', error);
      Sentry.captureException(error);

      try {
        if (proposal.strategies.length < 1) {
          return [];
        }

        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        let votingPowerSelf;
        if (typeof snapshot === 'number') {
          votingPowerSelf = await dispatch(
            'loadVotingPowerSelfAtSnapshot',
            snapshot
          );
        } else {
          const possibleBlockNumber = Number.parseInt(snapshot);
          // other representations of snapshot as
          // 'latest', etc
          if (Number.isNaN(possibleBlockNumber)) {
            const blockNumber: number = await dispatch('getBlockNumber');

            votingPowerSelf = await dispatch(
              'loadVotingPowerSelfAtSnapshot',
              blockNumber
            );
          } else {
            votingPowerSelf = await dispatch(
              'loadVotingPowerSelfAtSnapshot',
              possibleBlockNumber
            );
          }
        }

        const res = new Array(proposal.strategies.length).fill({});
        res[0] = {
          [rootState.account.currentAddress]: Number.parseFloat(votingPowerSelf)
        };

        return res;
      } catch (fallbackError) {
        console.error('failed to get self scores', fallbackError);
        Sentry.captureException(fallbackError);

        throw fallbackError;
      }
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
      throw error;
    }
  },
  async loadPowerInfo({
    state,
    commit,
    dispatch,
    getters,
    rootState
  }): Promise<void> {
    try {
      // resolve with existing spaceInfo or fetch the new one
      const spaceInfoPromise = getters.spaceInfo
        ? Promise.resolve(getters.spaceInfo)
        : getSpace(state.spaceId);

      // current community voting power
      if (getters.communityVotingPower === '0') {
        const communityVotingPower = await dispatch('loadCommunityVotingPower');
        commit('setCommunityVotingPower', communityVotingPower);

        if (ensureAccountStateIsSafe(rootState.account)) {
          setToPersistStore(
            rootState.account.currentAddress,
            'governance-power',
            'community',
            communityVotingPower,
            COMMUNITY_VOTING_POWER_EXPIRE_TIME
          );
        }
      }

      // current self voting power
      const votingPowerSelfPromise = dispatch('loadCurrentVotingPowerSelf');

      const [spaceInfo] = await Promise.all([
        spaceInfoPromise,
        votingPowerSelfPromise
      ]);

      commit('setSpaceInfo', spaceInfo);
      commit('setPowerNeededToBecomeAProposer', spaceInfo.filters.minScore);

      if (ensureAccountStateIsSafe(rootState.account)) {
        setToPersistStore(
          rootState.account.currentAddress,
          'governance-space',
          'info',
          spaceInfo,
          SPACE_INFO_EXPIRE_TIME
        );
      }
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
      addSentryBreadcrumb({
        message: 'trying to use fallback community voting power scenario'
      });

      try {
        if (!ensureAccountStateIsSafe(rootState.account)) {
          throw new Error('account is not ready');
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
    { dispatch, state, rootState, getters, commit },
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

      return fromWei(votingPowerSelfInWei.result.votingPower, 18);
    } catch (error) {
      console.warn(
        'failed to load self voting power, trying a votehub fallback',
        error
      );
      Sentry.captureException(error);
      addSentryBreadcrumb({
        message: 'trying to use fallback self voting power votehub api scenario'
      });

      try {
        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        let spaceInfo = getters.spaceInfo;
        if (spaceInfo === undefined) {
          // if spaceInfo is not ready yet
          spaceInfo = await getSpace(state.spaceId);
          commit('setSpaceInfo', spaceInfo);

          setToPersistStore(
            rootState.account.currentAddress,
            'governance-space',
            'info',
            spaceInfo,
            SPACE_INFO_EXPIRE_TIME
          );
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

        return scores
          .reduce((acc, score) => {
            return (
              acc +
              (score[rootState.account?.currentAddress ?? 'missing_address'] ??
                0)
            );
          }, 0)
          .toString();
      } catch (fallbackErrorVoteApi) {
        console.warn(
          'failed to load self voting power from votehub api, trying a fallback',
          fallbackErrorVoteApi
        );
        Sentry.captureException(error);
        addSentryBreadcrumb({
          message: 'trying to use fallback self voting power on-chain scenario'
        });

        try {
          if (!ensureAccountStateIsSafe(rootState.account)) {
            throw new Error('account is not ready');
          }

          return await getVotingPowerSelfFromChain(
            rootState.account.currentAddress,
            rootState.account.networkInfo.network,
            rootState.account.provider.web3,
            snapshot
          );
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
  async loadCurrentVotingPowerSelf({
    commit,
    dispatch,
    getters
  }): Promise<string> {
    const power = getters.votingPowerSelf;
    if (power !== '0') {
      return power;
    }

    const votingPowerSelf = await dispatch(
      'loadVotingPowerSelfAtSnapshot',
      undefined
    );
    commit('setVotingPowerSelf', votingPowerSelf);

    return votingPowerSelf;
  },
  async getBlockNumber({ commit, rootState, getters }): Promise<number> {
    const blockNumber = getters.blockNumberCached;
    if (blockNumber !== undefined) {
      return blockNumber;
    }

    try {
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

      commit('setBlockNumber', res);

      return res;
    } catch (error) {
      console.warn(
        'failed to get blockNumber, trying an etherscan fallback',
        error
      );
      Sentry.captureException(error);
      addSentryBreadcrumb({
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

        commit('setBlockNumber', result.result);

        return result.result;
      } catch (fallbackErrorEtherscan) {
        console.warn(
          'failed to get blockNumber from etherscan, trying an infura fallback',
          fallbackErrorEtherscan
        );
        addSentryBreadcrumb({
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

          commit('setBlockNumber', result.result);

          return result.result;
        } catch (fallbackErrorInfura) {
          if (getters.blockNumberCached === undefined) {
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
            getters.blockNumberCached
          );
          Sentry.captureException(fallbackErrorInfura);
          return getters.blockNumberCached;
        }
      }
    }
  }
};

export type ActionType = typeof actions;
export default actions;
