import { sameAddress } from './../../../../utils/address';
import { GetterTree } from 'vuex';
import { AccountStoreState } from '../types';
import { RootStoreState } from '@/store/types';
import { add, divide, isFinite, isNaN, multiply } from '@/utils/bigmath';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';

export default {
  treasuryBonusNative(state, getters): string {
    if (state.treasuryBonus === undefined) {
      return '0';
    }
    return multiply(state.treasuryBonus, getters.usdcNativePrice);
  },
  treasuryBoost(state): string {
    if (
      state.treasuryBalanceMove === undefined ||
      state.treasuryBalanceLP === undefined ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    const network = state.networkInfo.network;
    const tokenWeight = '1';
    const lpWeight = '2.5';

    const moveBalanceOnWallet =
      state.tokens.find((t) =>
        sameAddress(t.address, getMoveAssetData(network).address)
      )?.balance ?? '0';
    const lpBalanceOnWallet =
      state.tokens.find((t) =>
        sameAddress(t.address, getMoveWethLPAssetData(network).address)
      )?.balance ?? '0';

    let boostMove = multiply(
      divide(
        state.treasuryBalanceMove,
        add(moveBalanceOnWallet, state.treasuryBalanceMove)
      ),
      tokenWeight
    );

    if (isNaN(boostMove) || !isFinite(boostMove)) {
      boostMove = '0';
    }

    let boostLP = multiply(
      divide(
        state.treasuryBalanceLP,
        add(lpBalanceOnWallet, state.treasuryBalanceLP)
      ),
      lpWeight
    );

    if (isNaN(boostLP) || !isFinite(boostLP)) {
      boostLP = '0';
    }

    const boost = add(boostMove, boostLP);

    return boost;
  }
} as GetterTree<AccountStoreState, RootStoreState>;
