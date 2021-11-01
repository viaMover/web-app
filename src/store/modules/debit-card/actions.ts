import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { checkIsNftPresent } from '@/services/chain/nft/utils';
import { DebitCardApiError } from '@/services/mover';
import { getCardInfo } from '@/services/mover/debit-card/service';
import {
  getAvailableSkinsFromPersist,
  getCurrentSkinFromPersist,
  setAvailableSkinsToPersist,
  setCurrentSkinToPersist
} from '@/settings';

import { RootStoreState } from '../../types';
import { allSkins, defaultSkin } from './consts';
import { DebitCardStoreState, Skin } from './types';

export default {
  async loadInfo({ commit, dispatch, rootState }): Promise<void> {
    try {
      commit('setIsLoading', true);
      commit('setError', undefined);

      const currentSkinPromise = dispatch('loadSkins');

      await Promise.all([currentSkinPromise]);

      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      const cardInfo = await getCardInfo(rootState.account.currentAddress);
      if (cardInfo.isError) {
        throw new DebitCardApiError(cardInfo.error);
      }

      commit('setCardState', cardInfo.result.state);
      commit('setCardEventHistory', cardInfo.result.eventHistory);
      commit('setCardInfo', cardInfo.result.info);

      commit('setIsLoading', false);
    } catch (error) {
      console.error('failed to load debit card module info', error);
      Sentry.captureException(error);
      commit('setIsLoading', false);
      commit('setError', error);
    }
  },
  async loadCurrentSkin({ commit, rootState }): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }

    const persistedSkin = await getCurrentSkinFromPersist(
      rootState.account.currentAddress
    );

    if (persistedSkin === undefined) {
      // no skin in persist
      commit('setCurrentSkin', defaultSkin);
      await setCurrentSkinToPersist(
        rootState.account.currentAddress,
        defaultSkin,
        false
      );
    } else if (persistedSkin.nftAddress === undefined) {
      // there is a skin which doesn't have an address to check
      // (not NFT-bound like 'default')
      // persist update is not needed
      commit('setCurrentSkin', persistedSkin);
    } else {
      // there is a skin, it is NFT-bound
      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      try {
        const ownsCorrespondingNFT = await checkIsNftPresent(
          rootState.account.provider.web3,
          rootState.account.currentAddress,
          persistedSkin.nftAddress
        );

        if (!ownsCorrespondingNFT) {
          // the user doesn't have an NFT anymore
          commit('setCurrentSkin', defaultSkin);
          await setCurrentSkinToPersist(
            rootState.account.currentAddress,
            defaultSkin,
            false
          );
        } else {
          // the user still has an NFT, persist update is not needed
          commit('setCurrentSkin', persistedSkin);
        }
      } catch (error) {
        console.warn(
          'failed to check if the NFT is present',
          persistedSkin,
          error
        );
        Sentry.captureException(error);

        // an error was thrown during check if NFT is present
        // but this doesn't mean that the user doesn't have an
        // NFT anymore. We'll set a default for a while until
        // the next attempt
        commit('setCurrentSkin', defaultSkin);
      }
    }
  },
  async loadAvailableSkins({ commit, rootState }): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }
    const persistedAvailableSkins = await getAvailableSkinsFromPersist(
      rootState.account.currentAddress
    );

    const skinsWithAvailabilityInfo = await Promise.all(
      allSkins.map(async (skin) => {
        if (skin.nftAddress === undefined) {
          return {
            skin,
            available: true
          };
        }

        if (persistedAvailableSkins.includes(skin.nftAddress)) {
          return {
            skin,
            available: true
          };
        }

        // completely unnecessary checks
        // but TypeScript doesn't like
        // closures and does not propagate
        // null-assertion safe checks
        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        if (rootState.account?.provider?.web3 === undefined) {
          throw new Error('failed to get web3 provider');
        }

        try {
          return {
            skin,
            available: await checkIsNftPresent(
              rootState.account.provider.web3,
              rootState.account.currentAddress,
              skin.nftAddress
            )
          };
        } catch (error) {
          console.warn('failed to check if the NFT is present', skin, error);
          Sentry.captureException(error);
          return {
            skin,
            available: false
          };
        }
      })
    );

    const availableSkins = skinsWithAvailabilityInfo
      .filter((entry) => entry.available)
      .map((entry) => entry.skin);

    setAvailableSkinsToPersist(
      rootState.account.currentAddress,
      availableSkins
    );
    commit('setAvailableSkins', availableSkins);
  },
  async changeSkin(
    { commit, rootState },
    skinToBeApplied: Skin
  ): Promise<void> {
    commit('setCurrentSkin', skinToBeApplied);
    if (rootState.account?.currentAddress === undefined) {
      return;
    }

    setCurrentSkinToPersist(
      rootState.account.currentAddress,
      skinToBeApplied,
      skinToBeApplied.id !== defaultSkin.id &&
        skinToBeApplied.nftAddress !== undefined
    );
  }
} as ActionTree<DebitCardStoreState, RootStoreState>;
