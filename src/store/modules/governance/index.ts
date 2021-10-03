import { Module } from 'vuex';

import { RootStoreState } from '@/store/types';
import { isProduction } from '@/settings';

import {
  defaultCachePeriodSeconds,
  defaultPowerNeededToBecomeAProposer,
  defaultProposalDurationDays,
  minimumVotingThresholdMultiplier,
  moverSpaceId
} from '@/services/mover/governance';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { GovernanceStoreState } from './types';

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
    powerNeededToBecomeAProposer: defaultPowerNeededToBecomeAProposer,
    minimumVotingThresholdMultiplier: minimumVotingThresholdMultiplier,
    communityVotingPower: 0,
    votingPowerSelf: 0,
    spaceId: moverSpaceId,
    cachePeriodSeconds: defaultCachePeriodSeconds
  },
  actions,
  getters,
  mutations
} as Module<GovernanceStoreState, RootStoreState>;
