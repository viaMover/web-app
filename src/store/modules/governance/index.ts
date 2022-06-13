import dayjs from 'dayjs';

import {
  defaultProposalDurationDays,
  getDefaultMinimumVotingThresholdMultiplier,
  getDefaultPowerNeededToBecomeAProposer,
  moverSpaceId
} from '@/services/mover/governance';
import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { GovernanceStoreState } from './types';

const now = dayjs().unix();

export const initialState: GovernanceStoreState = {
  isLoadingMinimal: false,
  isLoading: false,

  spaceInfo: { data: undefined, expDate: Date.now() },
  proposals: new Map(),

  communityVotingPower: { data: '0', expDate: Date.now() },
  votingPowerSelf: { data: '0', expDate: Date.now() },
  proposalDurationDays: defaultProposalDurationDays,
  powerNeededToBecomeAProposer: getDefaultPowerNeededToBecomeAProposer(now),
  minimumVotingThresholdMultiplier:
    getDefaultMinimumVotingThresholdMultiplier(now),
  spaceId: moverSpaceId,
  blockNumberCached: { data: undefined, expDate: Date.now() }
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
