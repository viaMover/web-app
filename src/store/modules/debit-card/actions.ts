import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';
import { SHA3 } from 'sha3';

import { checkIsNftPresent } from '@/services/chain/nft/utils';
import {
  changePhoneNumber,
  DebitCardApiError,
  getCardInfo,
  orderCard,
  validatePhoneNumber
} from '@/services/mover/debit-card';
import {
  getAvailableSkinsFromPersist,
  getCurrentSkinFromPersist,
  getEmailHashFromPersist,
  setAvailableSkinsToPersist,
  setCurrentSkinToPersist,
  setEmailHashToPersist
} from '@/settings';

import { RootStoreState } from '../../types';
import { allSkins, defaultSkin } from './consts';
import {
  DebitCardStoreState,
  OrderCardParams,
  OrderState,
  Skin
} from './types';

export default {
  async loadInfo(
    { state, commit, dispatch, rootState },
    refetch = false
  ): Promise<void> {
    const load = async (): Promise<void> => {
      try {
        commit('setIsLoading', true);
        commit('setError', undefined);

        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        if (state.emailHash === undefined) {
          const emailHashWithSignature = await getEmailHashFromPersist(
            rootState.account.currentAddress
          );
          if (emailHashWithSignature === undefined) {
            commit('setCardState', 'order_now');
            commit('setOrderState', undefined);
            commit('setIsLoading', false);
            commit('setError', undefined);
            return;
          }

          commit('setEmailHash', emailHashWithSignature.hash);
          commit('setEmailSignature', emailHashWithSignature.signature);
          // reapply cache valid time period
          setEmailHashToPersist(
            rootState.account.currentAddress,
            emailHashWithSignature
          );
        }

        await dispatch('loadCurrentSkin', refetch);

        if (rootState.account?.currentAddress === undefined) {
          throw new Error('failed to get current address');
        }

        if (state.emailHash === undefined) {
          throw new Error('missing email hash');
        }

        if (state.emailSignature === undefined) {
          throw new Error('missing email signature');
        }

        const cardInfo = await getCardInfo(
          rootState.account.currentAddress,
          state.email,
          state.emailHash,
          state.emailSignature
        );
        if (cardInfo.isError) {
          throw new DebitCardApiError(cardInfo.error);
        }

        commit('setCardState', cardInfo.result.state);
        commit('setOrderState', cardInfo.result.orderState ?? 'order_form');
        commit('setCardEventHistory', cardInfo.result.eventHistory);
        commit('setCardInfo', cardInfo.result.info);

        commit('setIsLoading', false);
      } catch (error) {
        console.error('failed to load debit card module info', error);
        Sentry.captureException(error);
        commit('setIsLoading', false);
        commit('setError', error);
        commit('setLoadingPromise', undefined);
      }
    };

    if (!refetch && state.loadingPromise !== undefined) {
      return state.loadingPromise;
    }

    const loadingPromise = load();
    commit('setLoadingPromise', loadingPromise);
    return loadingPromise;
  },
  async loadCurrentSkin(
    { state, commit, rootState },
    refetch = false
  ): Promise<void> {
    if (!refetch && state.currentSkin !== undefined) {
      return;
    }

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
  async loadAvailableSkins(
    { state, commit, rootState },
    refetch = false
  ): Promise<void> {
    if (!refetch && state.availableSkins !== undefined) {
      return;
    }

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
  },
  // initialize or restore debit card ordering flow
  async setEmail({ commit, rootState }, email: string): Promise<void> {
    try {
      commit('setEmail', email);

      const hash = new SHA3().update(email).digest('hex');
      commit('setEmailHash', hash);

      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      // sign hash with signature to create an identifying token
      const signature = await rootState.account.provider.web3.eth.personal.sign(
        `Account ${hash} Mover`,
        rootState.account.currentAddress,
        ''
      );
      commit('setEmailSignature', signature);

      // persist hash and signature to be able to recover state
      // from initial load
      setEmailHashToPersist(rootState.account.currentAddress, {
        hash,
        signature
      });
    } catch (error) {
      console.error('failed to set email signature', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  async orderCard(
    { state, commit, dispatch, rootState },
    params: OrderCardParams
  ): Promise<void> {
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
      }

      if (state.emailHash === undefined) {
        throw new Error('missing email hash');
      }

      if (state.emailSignature === undefined) {
        throw new Error('missing email signature');
      }

      commit('setPhoneNumber', params.phone);

      const personalDataSignature =
        await rootState.account.provider.web3.eth.personal.sign(
          JSON.stringify(params),
          rootState.account.currentAddress,
          ''
        );

      const res = await orderCard(
        params,
        rootState.account.currentAddress,
        personalDataSignature,
        state.emailHash,
        state.emailSignature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error);
      }

      await dispatch('setOrderState', 'validate_phone');
    } catch (error) {
      console.error('failed to order card', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  async validatePhoneNumber({ state, rootState }, code: string): Promise<void> {
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (state.emailHash === undefined) {
        throw new Error('missing email hash');
      }

      if (state.emailSignature === undefined) {
        throw new Error('missing email signature');
      }

      const res = await validatePhoneNumber(
        code,
        rootState.account.currentAddress,
        state.emailHash,
        state.emailSignature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error);
      }
    } catch (error) {
      console.error('failed to validate phone number', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  setOrderState({ commit }, orderState: OrderState): void {
    commit('setOrderState', orderState);
  },
  async changePhoneNumber(
    { state, commit, dispatch, rootState },
    newPhoneNumber: string
  ): Promise<void> {
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (state.emailHash === undefined) {
        throw new Error('missing email');
      }

      if (state.emailSignature === undefined) {
        throw new Error('missing email signature');
      }

      commit('setPhoneNumber', newPhoneNumber);

      const res = await changePhoneNumber(
        newPhoneNumber,
        rootState.account.currentAddress,
        state.emailHash,
        state.emailSignature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error);
      }

      dispatch('setOrderState', 'validate_phone');
    } catch (error) {
      console.error('failed to change phone number', error);
      Sentry.captureException(error);
      throw error;
    }
  }
} as ActionTree<DebitCardStoreState, RootStoreState>;
