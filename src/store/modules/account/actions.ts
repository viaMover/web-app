import * as Sentry from '@sentry/vue';
import sample from 'lodash-es/sample';
import Web3 from 'web3';

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
import { BuildExplorer } from '@/services/explorer';
import {
  getAvatarFromPersist,
  getIsOlympusAvatarKnownFromPersist,
  isFeatureEnabled,
  setAvatarToPersist,
  setIsOlympusAvatarKnownToPersist
} from '@/settings';
import {
  removeAccountBoundPersistItemsFromLocalStorage,
  removeExpiredPersistItemsFromLocalStorage
} from '@/settings/persist/utils';
import { ActionFuncs } from '@/store/types';
import { Network } from '@/utils/networkTypes';
import { getAllTokens } from '@/wallet/allTokens';
import { getBaseTokenPrice } from '@/wallet/baseTokenPrice';
import { getGasPrices } from '@/wallet/gas';
import {
  clearOffchainExplorer,
  initOffchainExplorer
} from '@/wallet/offchainExplorer';
import { getTestnetAssets } from '@/wallet/references/testnetAssets';
import { TokenWithBalance, Transaction } from '@/wallet/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  AccountData,
  AccountStoreState,
  Avatar,
  EmitChartRequestPayload,
  ensureAccountStateIsSafe,
  InitWalletPayload,
  ProviderData,
  RefreshWalletPayload
} from './types';
import allAvatars from '@/../data/avatars.json';
import { getOlympusAvatar, isOlympusAvatar } from '@/../data/olympus-avatar';

const GAS_UPDATE_INTERVAL = 60000; // 60s
const GAS_INITIAL_DELAY = 500; // 500ms to reduce the chance to reach the  rate limit of etherscan in case of page reload

type Actions = {
  emitChartRequest: void;
  startGasListening: void;
  stopGasListening: void;
  addTransaction: void;
  toggleIsDebitCardSectionVisible: void;
  toggleIsDepositCardSectionVisible: void;
  setCurrentWallet: Promise<void>;
  setIsDetecting: void;
  loadAvatar: Promise<void>;
  toggleAvatar: Promise<void>;
  initWallet: Promise<void>;
  refreshWallet: Promise<void>;
  updateWalletAfterTxn: Promise<void>;
  waitWallet: Promise<boolean>;
  disconnectWallet: Promise<void>;
  getBasicPrices: Promise<void>;
};

const actions: ActionFuncs<
  Actions,
  AccountStoreState,
  MutationType,
  GetterType
> = {
  emitChartRequest({ state }, payload: EmitChartRequestPayload): void {
    try {
      state.explorer?.getChartData(
        payload.assetCode,
        payload.nativeCurrency,
        payload.chartsType
      );
    } catch (err) {
      console.error(`Can't get chart data:`, err);
      Sentry.captureException(err);
    }
  },
  startGasListening({ commit, state }, caller: string): void {
    commit('pushGasListenerCaller', caller);

    if (state.gasUpdating) {
      return;
    }

    commit('setGasUpdating', true);

    if (state.gasUpdaterHandle !== undefined) {
      return;
    }

    const updateGasFunc = async () => {
      try {
        const resp = await getGasPrices(state.networkInfo?.network);
        commit('setGasPrices', resp);
      } catch (err) {
        commit('setRefreshEror', err);
        console.log(`Can't get gas prices, err:`, err);
        Sentry.captureException(err);
      } finally {
        if (state.gasUpdating) {
          commit(
            'setGasUpdaterHandle',
            window.setTimeout(updateGasFunc, GAS_UPDATE_INTERVAL)
          );
        } else {
          commit('clearGasUpdaterHandle');
        }
      }
    };

    commit(
      'setGasUpdaterHandle',
      window.setTimeout(updateGasFunc, GAS_INITIAL_DELAY)
    );
  },
  stopGasListening({ commit, state }, caller): void {
    commit('popGasListenerCaller', caller);

    if (state.gasUpdaterCallers.length === 0 && state.gasUpdating) {
      commit('setGasUpdating', false);
    }
  },
  addTransaction({ commit }, transaction: Transaction): void {
    commit('addTransaction', transaction);
  },
  toggleIsDebitCardSectionVisible({ commit }): void {
    commit('toggleIsDebitCardSectionVisible');
  },
  toggleIsDepositCardSectionVisible({ commit }): void {
    commit('toggleIsDepositCardSectionVisible');
  },
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

      await dispatch('getBasicPrices');

      Sentry.setContext('crypto_person', {
        address: state.currentAddress,
        network: state.networkInfo.network
      });
      Sentry.setTag('crypto_person_address', state.currentAddress);

      if (payload.init) {
        removeExpiredPersistItemsFromLocalStorage();

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
          console.log('Starting Chain explorer...');

          const explorerInitPromise = BuildExplorer(
            state.currentAddress,
            state.nativeCurrency,
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
            },
            (val: boolean) => {
              commit('setIsTransactionsListLoaded', val);
            },
            (val: boolean) => {
              commit('setIsTokensListLoaded', val);
            }
          );

          explorerInitPromise
            .then((explorer) => {
              commit('setExplorer', explorer);
            })
            .catch((error) => {
              Sentry.captureException(error);
            });
        }
      } else {
        console.info('Not mainnet - should use balancer');
        commit('setIsTokensListLoaded', false);
        commit('setIsTransactionsListLoaded', false);
        const tokensList = getTestnetAssets(state.networkInfo.network);
        const tokensWithAmount = await getWalletTokens(
          tokensList,
          state.currentAddress,
          state.provider.web3,
          state.networkInfo.network
        );
        console.info('tokensWithAmount: ', tokensWithAmount);
        commit('setWalletTokens', tokensWithAmount);
        commit('setIsTokensListLoaded', true);
        commit('setIsTransactionsListLoaded', true);
      }

      dispatch('treasury/loadMinimalInfo', undefined, {
        root: true
      });

      dispatch('nft/loadNFTInfo', undefined, {
        root: true
      }).then(() => dispatch('loadAvatar'));

      dispatch('savings/loadMinimalInfo', undefined, {
        root: true
      });

      if (isFeatureEnabled('isNibbleShopEnabled')) {
        dispatch('shop/refreshAssetsInfoList', undefined, {
          root: true
        });
      }

      if (isFeatureEnabled('isVaultsRaceEnabled')) {
        dispatch('games/init', undefined, {
          root: true
        });
      }

      console.info('Wallet refreshed');
    } finally {
      state.isWalletLoading = false;
    }
  },
  async updateWalletAfterTxn({ dispatch }): Promise<void> {
    const nftInfoPromise = dispatch('nft/loadNFTInfo', undefined, {
      root: true
    });
    const savingsInfoPromise = dispatch('savings/loadMinimalInfo', undefined, {
      root: true
    });
    const treasuryInfoPromise = dispatch(
      'treasury/loadMinimalInfo',
      undefined,
      { root: true }
    );
    const debitCardAvailableSkinsPromise = isFeatureEnabled(
      'isDebitCardEnabled'
    )
      ? dispatch('debitCard/loadAvailableSkins', undefined, {
          root: true
        })
      : Promise.resolve();

    const promisesResults = await Promise.allSettled([
      savingsInfoPromise,
      treasuryInfoPromise,
      nftInfoPromise,
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
    if (state.currentAddress) {
      removeAccountBoundPersistItemsFromLocalStorage(state.currentAddress);
    }

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
  },
  async getBasicPrices({ state, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(state)) {
      throw new Error('account state is not ready');
    }

    try {
      const getEthPriceInUsdPromise = getBaseTokenPrice(
        state.networkInfo.network
      );

      const getMovePriceInWethPromise = getMOVEPriceInWETH(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      ).then((moveInWethPrice) => {
        commit('setMovePriceInWeth', moveInWethPrice);
        return moveInWethPrice;
      });

      const slpPriceInWETHPromise = getMovePriceInWethPromise.then(
        (moveInWethPrice) =>
          getSLPPriceInWETH(
            moveInWethPrice,
            state.currentAddress,
            state.networkInfo.network,
            state.provider.web3
          )
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

      const [ethInUsdPrice, slpInWethPrice, usdcInWethPrice, eursInWethPrice] =
        await Promise.all([
          getEthPriceInUsdPromise,
          slpPriceInWETHPromise,
          getUSDCPriceInWETHPromise,
          getEURSPriceInWETHPromise,
          getMovePriceInWethPromise
        ]);
      commit('setEthPrice', ethInUsdPrice);
      commit('setSLPPriceInWETH', slpInWethPrice);
      commit('setUsdcPriceInWeth', usdcInWethPrice);
      commit('setEursPriceInWeth', eursInWethPrice);
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }
};

export type ActionType = typeof actions;
export default actions;
