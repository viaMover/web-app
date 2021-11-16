import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';
import { SHA3 } from 'sha3';

import { checkIsNftPresent } from '@/services/chain/nft/utils';
import {
  changePhoneNumber,
  DebitCardApiError,
  getCardInfo,
  orderCard,
  sendEmailHash,
  validatePhoneNumber
} from '@/services/mover/debit-card';
import { FetchInfoReturn } from '@/services/mover/debit-card/types';
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
  mapServiceState,
  OrderCardParams,
  OrderState,
  Skin
} from './types';

export default {
  handleInfoResult({ commit }, cardInfo: FetchInfoReturn) {
    const mappedState = mapServiceState(cardInfo.status);
    commit('setCardState', mappedState.cardState);
    commit('setOrderState', mappedState.orderState);
    commit('setKycLink', cardInfo.KYClink);
    commit('setCardEventHistory', []);
    commit('setCardInfo', undefined);
  },
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

        const res = await getCardInfo(
          rootState.account.currentAddress,
          state.emailHash,
          state.emailSignature
        );
        if (res.isError) {
          throw new DebitCardApiError(res.error, res.shortError);
        }

        await dispatch('handleInfoResult', res.result);

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
      return;
    }

    if (persistedSkin.nftAddress === undefined) {
      // there is a skin which doesn't have an address to check
      // (not NFT-bound like 'default')
      // persist update is not needed
      commit('setCurrentSkin', persistedSkin);
      return;
    }

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
        // there is a skin which doesn't have an address to check
        // (not NFT-bound like 'default')
        if (skin.nftAddress === undefined) {
          return {
            skin,
            available: true
          };
        }

        // there is a persisted nft ownership record, not expired
        // so we don't perform checks and assume the skin as
        // still available to choose from
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

        // perform ownership check
        // (if nft is present on the account of user)
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

    // update available skins persist item
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
  async setEmail(
    { commit, dispatch, rootState },
    email: string
  ): Promise<void> {
    try {
      const hash = new SHA3().update(email).digest('hex');

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

      // send identifying non-confidential token
      // to the API so it knows what user corresponds with
      // what debit card account of Trastra
      const res = await sendEmailHash(
        rootState.account.currentAddress,
        email,
        hash,
        signature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error, res.shortError);
      }

      // persist hash and signature to be able to recover state
      // from initial load
      await setEmailHashToPersist(rootState.account.currentAddress, {
        hash,
        signature
      });

      commit('setEmail', email);
      commit('setEmailHash', hash);
      commit('setEmailSignature', signature);

      commit('setIsLoading', true);
      await dispatch('handleInfoResult', res.result);
      commit('setIsLoading', false);
    } catch (error) {
      console.error('failed to set email signature', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  // send personal data to the Trastra to initialize flow
  // (order flow, step 1)
  async orderCard(
    { state, commit, rootState },
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

      const mappedParams = {
        ...params,
        phone: `+${params.phone}` // prepend phone with '+' sign
      };

      const personalDataSignature =
        await rootState.account.provider.web3.eth.personal.sign(
          JSON.stringify(mappedParams),
          rootState.account.currentAddress,
          ''
        );

      const res = await orderCard(
        mappedParams,
        rootState.account.currentAddress,
        personalDataSignature,
        state.emailHash,
        state.emailSignature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error, res.shortError);
      }

      const mappedState = mapServiceState(res.result.status);
      commit('setOrderState', mappedState.orderState);
      commit('setCardState', mappedState.cardState);

      // TODO: Use own state update or rely on server?
      // // if API succeeds with personal data
      // // then we assume that the next stap is
      // // validate_phone (before KYC starts)
      // dispatch('setOrderState', 'validate_phone');
    } catch (error) {
      console.error('failed to order card', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  // validate phone number (order flow, step 2) to start KYC
  async validatePhoneNumber(
    { state, commit, dispatch, rootState },
    code: string
  ): Promise<void> {
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
        throw new DebitCardApiError(res.error, res.shortError);
      }

      // TODO: Use own state update or rely on server?
      commit('setKycLink', res.result);

      // once we are done with phone validation and
      // API confirms that SMS was sent -- we load the next part
      // of debit card flow -> pending
      dispatch('loadInfo', true);
    } catch (error) {
      console.error('failed to validate phone number', error);
      Sentry.captureException(error);
      throw error;
    }
  },
  setOrderState({ commit }, orderState: OrderState): void {
    commit('setOrderState', orderState);
  },
  // change (append) phone number to the existing Trastra user record
  // so new SMS will be sent (order flow, step 2* (optional))
  async changePhoneNumber(
    { state, commit, rootState },
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
        `+${newPhoneNumber}`, // prepend phone with '+' sign
        rootState.account.currentAddress,
        state.emailHash,
        state.emailSignature
      );
      if (res.isError) {
        throw new DebitCardApiError(res.error, res.shortError);
      }

      // TODO: Use own state update or rely on server?
      // return back to the order flow
      commit('setOrderState', 'validate_phone');
    } catch (error) {
      console.error('failed to change phone number', error);
      Sentry.captureException(error);
      throw error;
    }
  }
} as ActionTree<DebitCardStoreState, RootStoreState>;
