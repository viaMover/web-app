import Web3 from 'web3';

import { MoverAPISmartTreasuryService } from '@/services/v2/api/mover/smart-treasury/MoverAPISmartTreasuryService';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury/SmartTreasuryOnChainService';
import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';
import { Network } from '@/utils/networkTypes';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { TreasuryStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isTreasuryInfoLoading: true,
    treasuryInfo: undefined,

    receipts: new Map(),

    treasuryBalanceMove: undefined,
    treasuryBalanceLP: undefined,
    treasuryBonus: undefined,
    treasuryAPY: undefined,
    treasuryTotalStakedMove: undefined,
    treasuryTotalStakedMoveEthLP: undefined,

    powercardBalance: undefined,
    powercardState: undefined,
    powercardActiveTime: 0,
    powercardCooldownTime: 0,
    apiService: new MoverAPISmartTreasuryService('', Network.mainnet),
    onChainService: new SmartTreasuryOnChainService(
      '',
      Network.mainnet,
      new Web3()
    )
  },
  actions,
  getters,
  mutations
} as AugmentedModule<TreasuryStoreState, ActionType, GetterType, MutationType>;
