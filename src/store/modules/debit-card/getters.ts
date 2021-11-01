import { GetterTree } from 'vuex';

import { RootStoreState } from '../../types';
import { DebitCardStoreState, Skin, SkinMinimal } from './types';

export default {
  availableSkins(state, getters, rootState): Array<Skin> {
    return state.availableSkins.map(mapSkin(rootState));
  },
  currentSkin(state, getters, rootState): Skin {
    return mapSkin(rootState)(state.currentSkin);
  }
} as GetterTree<DebitCardStoreState, RootStoreState>;

const mapSkin = (rootState: RootStoreState): ((skin: SkinMinimal) => Skin) => {
  return (skin: SkinMinimal): Skin => {
    let description = '';
    if (
      rootState.i18n?.te(`debitCard.changeSkin.skins.${skin.id}.description`)
    ) {
      description = rootState.i18n?.t(
        `debitCard.changeSkin.skins.${skin.id}.description`
      ) as string;
    }

    let name = skin.symbol;
    if (rootState.i18n?.te(`debitCard.changeSkin.skins.${skin.id}.name`)) {
      name = rootState.i18n?.t(
        `debitCard.changeSkin.skins.${skin.id}.name`
      ) as string;
    }

    return {
      id: skin.id,
      description: description,
      name: name,
      symbol: skin.symbol,
      nftAddress: skin.nftAddress
    };
  };
};
