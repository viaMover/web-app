import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';
import sample from 'lodash-es/sample';
import Web3 from 'web3';
import { provider } from 'web3-core';

import {
  bootIntercomSession,
  disconnectIntercomSession
} from '@/router/intercom-utils';
import { getWalletTokens } from '@/services/balancer';
import {
  getMOVEPriceInWETH,
  getSLPPriceInWETH,
  getUSDCPriceInWETH
} from '@/services/chain';
import { getEURSPriceInWETH } from '@/services/chain/token-prices/token-prices';
import { InitExplorer } from '@/services/zerion/explorer';
import {
  getAvatarFromPersist,
  getIsOlympusAvatarKnownFromPersist,
  isFeatureEnabled,
  setAvatarToPersist,
  setIsOlympusAvatarKnownToPersist
} from '@/settings';
import { RootStoreState } from '@/store/types';
import { Network } from '@/utils/networkTypes';
import { getAllTokens } from '@/wallet/allTokens';
import { getEthereumPrice } from '@/wallet/ethPrice';
import {
  clearOffchainExplorer,
  initOffchainExplorer
} from '@/wallet/offchainExplorer';
import { getTestnetAssets } from '@/wallet/references/testnetAssets';
import { TokenWithBalance, Transaction } from '@/wallet/types';

import {
  AccountData,
  AccountStoreState,
  Avatar,
  ProviderData
} from './../types';
import allAvatars from '@/../data/avatars.json';
import { getOlympusAvatar, isOlympusAvatar } from '@/../data/olympus-avatar';

export type RefreshWalletPayload = {
  injected: boolean;
  init: boolean;
};

export type InitWalletPayload = {
  provider: provider;
  injected: boolean;
  providerBeforeCloseCb: () => void;
};

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },
  setIsDetecting({ commit }, isDetecting: boolean): void {
    commit('setIsDetecting', isDetecting);
  },
  async loadAvatar({ commit, state, rootState, rootGetters }): Promise<void> {
    const avatars: Array<Avatar> = allAvatars as Array<Avatar>;

    const olympusAvatar = getOlympusAvatar(rootState.i18n);
    const hasOlympusNft = rootGetters['nft/hasOlympus'];
    if (hasOlympusNft) {
      avatars.push(olympusAvatar);
    }

    commit('setAvatars', avatars);

    if (state.currentAddress === undefined) {
      commit('setAvatar', sample<Avatar>(state.avatars));
      return;
    }

    // if the user has seen olympus avatar at least once
    const isOlympusAvatarKnown = await getIsOlympusAvatarKnownFromPersist(
      state.currentAddress
    );

    // if they have never seen olympus avatar but have it
    // then force set the olympus avatar instead of the old one
    if (hasOlympusNft && !isOlympusAvatarKnown) {
      commit('setAvatar', olympusAvatar);
      await setAvatarToPersist(state.currentAddress, olympusAvatar);
      await setIsOlympusAvatarKnownToPersist(state.currentAddress, true);
      return;
    }

    const persistedValue = await getAvatarFromPersist(state.currentAddress);

    // if one have seen an avatar but don't have it anymore
    // then set avatar as never seen
    if (!hasOlympusNft && isOlympusAvatarKnown) {
      await setIsOlympusAvatarKnownToPersist(state.currentAddress, false);
    }

    // if they have seen an avatar therefore it's currently persisted
    // but don't have it anymore then revoke
    if (!hasOlympusNft && isOlympusAvatar(persistedValue)) {
      const newAvatar = sample<Avatar>(state.avatars);
      if (newAvatar === undefined) {
        return;
      }

      commit('setAvatar', newAvatar);
      await setAvatarToPersist(state.currentAddress, newAvatar);
      return;
    }

    if (persistedValue !== undefined) {
      commit('setAvatar', persistedValue);
      return;
    }

    const newAvatar = sample<Avatar>(state.avatars);
    if (newAvatar === undefined) {
      return;
    }

    commit('setAvatar', newAvatar);
    await setAvatarToPersist(state.currentAddress, newAvatar);
  },
  async toggleAvatar({ commit, state }): Promise<void> {
    if (
      isOlympusAvatar(state.avatar) &&
      state.currentAddress !== undefined &&
      !(await getIsOlympusAvatarKnownFromPersist(state.currentAddress))
    ) {
      await setIsOlympusAvatarKnownToPersist(state.currentAddress, true);
    }

    const prevIdx =
      state.avatars.findIndex((av) => {
        if (av.type === 'symbol') {
          return (
            state.avatar?.type === 'symbol' &&
            av.symbol === state.avatar?.symbol
          );
        }

        return (
          state.avatar?.type === 'image' &&
          av.imageSrc === state.avatar?.imageSrc
        );
      }) ?? -1;

    const newAvatar = state.avatars[(prevIdx + 1) % state.avatars.length];
    if (newAvatar === undefined) {
      return;
    }

    commit('setAvatar', newAvatar);
    if (state.currentAddress === undefined) {
      return;
    }

    await setAvatarToPersist(state.currentAddress, newAvatar);
  },

  async initWallet(
    { commit, dispatch },
    payload: InitWalletPayload
  ): Promise<void> {
    try {
      const web3Inst = new Web3(payload.provider);
      (
        web3Inst.eth as unknown as { maxListenersWarningThreshold: number }
      ).maxListenersWarningThreshold = 200;
      commit('setProvider', {
        providerBeforeClose: payload.providerBeforeCloseCb,
        web3: web3Inst,
        pureProvider: payload.provider
      } as ProviderData);

      commit('clearGasUpdaterHandle');
      await dispatch('refreshWallet', {
        injected: payload.injected,
        init: true
      } as RefreshWalletPayload);
    } catch (err) {
      console.log("can't init the wallet");
      console.log(err);
    }
  },

  async refreshWallet(
    { dispatch, commit, state },
    payload: RefreshWalletPayload
  ): Promise<void> {
    state.isWalletLoading = true;

    try {
      if (state.provider === undefined) {
        console.info("can't refresh wallet due to empty provider");
        return;
      }

      console.info('getting accounts...');
      let accounts;
      if (payload.injected) {
        accounts = await state.provider.web3.eth.requestAccounts();
      } else {
        accounts = await state.provider.web3.eth.getAccounts();
      }
      console.info('accounts: ', accounts);

      let balance = '';
      if (accounts) {
        balance = await state.provider.web3.eth.getBalance(accounts[0]);
      }
      console.info('balance of the current account:', balance);

      const chainId = await state.provider.web3.eth.getChainId();

      commit('setAccountData', {
        addresses: accounts,
        balance: balance,
        networkId: chainId
      } as AccountData);

      if (!state.currentAddress || !state.networkInfo) {
        console.info("can't refresh wallet due to empty address");
        return;
      }
      if (!state.networkInfo) {
        console.info("can't refresh wallet due to empty networkInfo");
        return;
      }

      Sentry.setContext('crypto_person', {
        address: state.currentAddress,
        network: state.networkInfo.network
      });
      Sentry.setTag('crypto_person_address', state.currentAddress);

      if (payload.init) {
        bootIntercomSession(state.currentAddress, {
          network: state.networkInfo.network
        });

        console.info('getting all tokens...');
        const allTokens = getAllTokens(state.networkInfo.network);
        commit('setAllTokens', allTokens);
      }

      console.info('Updating wallet tokens from Etherscan...');
      if (state.networkInfo.network === Network.mainnet) {
        if (payload.init) {
          console.log('Starting Offchain Explorer...');
          initOffchainExplorer(state.networkInfo.network);
          console.log('Starting Zerion...');
          const explorer = InitExplorer(
            state.currentAddress,
            'usd',
            state.networkInfo.network,
            (txns: Array<Transaction>) => {
              commit('setWalletTransactions', txns);
            },
            (txns: Array<Transaction>) => {
              commit('updateWalletTransactions', txns);
            },
            (txnsHashes: Array<string>) => {
              commit('removeWalletTransaction', txnsHashes);
            },
            (tokens: Array<TokenWithBalance>) => {
              commit('setWalletTokens', tokens);
            },
            (tokens: Array<TokenWithBalance>) => {
              commit('updateWalletTokens', tokens);
            },
            (tokens: Array<string>) => {
              commit('removeWalletTokens', tokens);
            },
            (chartData: Record<string, [number, number][]>) => {
              commit('setChartData', chartData);
            }
          );
          commit('setExplorer', explorer);
        }
      } else {
        console.info('Not mainnet - should use balancer');
        const tokensList = getTestnetAssets(state.networkInfo.network);
        console.info('tokensList: ', tokensList);
        const tokensWithAmount = await getWalletTokens(
          tokensList,
          state.currentAddress,
          state.provider.web3,
          state.networkInfo.network
        );
        console.info('tokensWithAmount: ', tokensWithAmount);
        commit('setWalletTokens', tokensWithAmount);
      }

      console.info('refresh eth price...');
      // TODO: works only for USD
      try {
        const ethPriceInUSD = await getEthereumPrice(state.networkInfo.network);
        commit('setEthPrice', ethPriceInUSD);
      } catch (e) {
        console.error("Can't get ETH price, stop loading data");
        Sentry.captureException(e);
        return;
      }

      const getMovePriceInWethPromise = getMOVEPriceInWETH(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );

      const getUSDCPriceInWETHPromise = getUSDCPriceInWETH(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );

      const getEURSPriceInWETHPromise = getEURSPriceInWETH(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );

      try {
        const [moveInWethPrice, usdcInWethPrice, eursInWethPrice] =
          await Promise.all([
            getMovePriceInWethPromise,
            getUSDCPriceInWETHPromise,
            getEURSPriceInWETHPromise
          ]);
        commit('setMovePriceInWeth', moveInWethPrice);
        commit('setUsdcPriceInWeth', usdcInWethPrice);
        commit('setEursPriceInWeth', eursInWethPrice);
      } catch (e) {
        Sentry.captureException(e);
        throw e;
      }

      try {
        const slpPriceInWETH = await getSLPPriceInWETH(
          state.movePriceInWeth ?? '0',
          state.currentAddress,
          state.networkInfo.network,
          state.provider.web3
        );
        commit('setSLPPriceInWETH', slpPriceInWETH);
      } catch (e) {
        Sentry.captureException(e);
        throw e;
      }

      const savingsFreshData = dispatch('fetchSavingsFreshData');
      const savingsInfoPromise = dispatch('fetchSavingsInfo');

      const treasuryFreshData = dispatch('fetchTreasuryFreshData');
      const treasuryInfoPromise = dispatch('fetchTreasuryInfo');
      const nftInfoPromise = dispatch('nft/loadNFTInfo', undefined, {
        root: true
      });

      let nibbleShopInfoPromise = Promise.resolve();
      if (isFeatureEnabled('isNibbleShopEnabled')) {
        nibbleShopInfoPromise = nibbleShopInfoPromise.then(() =>
          dispatch('shop/refreshAssetsInfoList', undefined, {
            root: true
          })
        );
      }
      const loadAvatarPromise = nftInfoPromise.then(() =>
        dispatch('loadAvatar')
      );
      const loadPowercardPromise = dispatch('fetchPowercardData');

      let gamesPromise = Promise.resolve();
      if (isFeatureEnabled('isVaultsRaceEnabled')) {
        gamesPromise = dispatch('games/init', undefined, {
          root: true
        });
      }

      const promisesResults = await Promise.allSettled([
        savingsInfoPromise,
        treasuryInfoPromise,
        savingsFreshData,
        treasuryFreshData,
        nftInfoPromise,
        loadAvatarPromise,
        nibbleShopInfoPromise,
        loadPowercardPromise,
        gamesPromise
      ]);

      const promisesErrors = promisesResults
        .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
        .map((p) => p.reason);

      if (promisesErrors.length > 0) {
        Sentry.captureException(promisesErrors);
      }

      console.info('Wallet refreshed');
    } finally {
      state.isWalletLoading = false;
    }
  },
  async updateWalletAfterTxn({ dispatch }): Promise<void> {
    const loadPowercardPromise = dispatch('fetchPowercardData');
    const savingsFreshData = dispatch('fetchSavingsFreshData');
    const treasuryFreshData = dispatch('fetchTreasuryFreshData');
    const nftInfoPromise = dispatch('nft/loadNFTInfo', undefined, {
      root: true
    });
    const debitCardAvailableSkinsPromise = isFeatureEnabled(
      'isDebitCardEnabled'
    )
      ? dispatch('debitCard/loadAvailableSkins', undefined, {
          root: true
        })
      : Promise.resolve();

    const promisesResults = await Promise.allSettled([
      savingsFreshData,
      treasuryFreshData,
      nftInfoPromise,
      loadPowercardPromise,
      debitCardAvailableSkinsPromise
    ]);
    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async waitWallet({ commit, state }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const checkWalletConnection = async () => {
        console.log('checkWalletConnection...');
        if (!state.isDetecting) {
          resolve(state.currentAddress !== undefined);
          return;
        }
        if (state.currentAddress !== undefined) {
          commit('setIsDetecting', false);
          resolve(true);
          return;
        }
        setTimeout(checkWalletConnection, 1000);
      };

      checkWalletConnection();
    });
  },
  async disconnectWallet({ commit, state }): Promise<void> {
    if (state.provider) {
      state.provider.providerBeforeClose();
      if (
        state.provider.pureProvider &&
        state.provider.pureProvider.disconnect
      ) {
        console.log('disconnecting provider...');
        await state.provider.pureProvider.disconnect();
      }
    }
    try {
      await state.web3Modal.clearCachedProvider();
    } catch (error) {
      console.error(error);
      Sentry.captureException("Can't close cached provider");
    }
    clearOffchainExplorer();
    commit('clearWalletData');
    disconnectIntercomSession();
  }
} as ActionTree<AccountStoreState, RootStoreState>;
