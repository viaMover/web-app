import { Module } from 'vuex';

import {
  defaultCachePeriodSeconds,
  defaultPowerNeededToBecomeAProposer,
  defaultProposalDurationDays,
  minimumVotingThresholdMultiplier,
  moverSpaceId
} from '@/services/mover/governance';
import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
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
    communityVotingPower: '0',
    votingPowerSelf: '0',
    spaceId: moverSpaceId,
    cachePeriodSeconds: defaultCachePeriodSeconds,
    isLoadingLastProposal: false
  },
  actions,
  getters,
  mutations
} as Module<GovernanceStoreState, RootStoreState>;
