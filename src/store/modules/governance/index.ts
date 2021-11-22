import { Module } from 'vuex';

import dayjs from 'dayjs';

import {
  defaultCachePeriodSeconds,
  defaultProposalDurationDays,
  getDefaultMinimumVotingThresholdMultiplier,
  getDefaultPowerNeededToBecomeAProposer,
  moverSpaceId
} from '@/services/mover/governance';
import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { GovernanceStoreState } from './types';

const now = dayjs().unix();

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,
    error: undefined,
    loadingPromise: undefined,
    spaceInfo: undefined,
    items: [],
    cacheInfoMap: {},
    cacheGenericInfoMap: {},
    proposalDurationDays: defaultProposalDurationDays,
    powerNeededToBecomeAProposer: getDefaultPowerNeededToBecomeAProposer(now),
    minimumVotingThresholdMultiplier:
      getDefaultMinimumVotingThresholdMultiplier(now),
    communityVotingPower: '0',
    votingPowerSelf: '0',
    spaceId: moverSpaceId,
    cachePeriodSeconds: defaultCachePeriodSeconds,
    isLoadingLastProposal: false,
    blockNumberCached: undefined
  },
  actions,
  getters,
  mutations
} as Module<GovernanceStoreState, RootStoreState>;
