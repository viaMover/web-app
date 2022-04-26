import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
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
import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { ZeroXAPIService } from '@/services/v2/api/0x';
import { CoinGeckoAPIService } from '@/services/v2/api/coinGecko';
import { MoverAPISavingsService } from '@/services/v2/api/mover/savings';
import { MoverAPISmartTreasuryService } from '@/services/v2/api/mover/smart-treasury';
import { MoverAPIStakingUbtService } from '@/services/v2/api/mover/staking-ubt';
import {
  CurrencyNotSupportedError,
  TheGraphAPIService
} from '@/services/v2/api/theGraph';
import { ISmartTreasuryBonusBalanceExecutor } from '@/services/v2/on-chain/mover/ISmartTreasuryBonusBalanceExecutor';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings/SavingsOnChainService';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury/SmartTreasuryOnChainService';
import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { SwapOnChainService } from '@/services/v2/on-chain/mover/swap';
import { getAssetPriceFromPriceRecord } from '@/services/v2/utils/price';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
import {
  getFromPersistStore,
  removeAccountBoundPersistItemsFromLocalStorage,
  removeExpiredPersistItemsFromLocalStorage,
  setToPersistStore
} from '@/settings/persist/utils';
import { ActionFuncs } from '@/store/types';
import { toArray } from '@/utils/arrays';
import { CommonErrors, errorToString } from '@/utils/errors';
import { NetworkInfo } from '@/utils/networkTypes';
import { getAllTokens } from '@/wallet/allTokens';
import { getBaseTokenPrice } from '@/wallet/baseTokenPrice';
import { getGasPrices } from '@/wallet/gas';
import {
  clearOffchainExplorer,
  initOffchainExplorer
} from '@/wallet/offchainExplorer';
import { getTestnetAssets } from '@/wallet/references/testnetAssets';
import {
  SmallTokenInfo,
  Token,
  TokenWithBalance,
  Transaction
} from '@/wallet/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  AccountData,
  AccountStoreState,
  EmitChartRequestPayload,
  ensureAccountStateIsSafe,
  FetchTokenPricesByContractAddressesPayload,
  InitWalletPayload,
  NativeCurrency,
  PriceRecord,
  ProviderData,
  RefreshWalletPayload
} from './types';

const GAS_UPDATE_INTERVAL = 60000; // 60s
const GAS_INITIAL_DELAY = 500; // 500ms to reduce the chance to reach the  rate limit of etherscan in case of page reload

type Actions = {
  emitChartRequest: void;
  startGasListening: void;
  stopGasListening: void;
  addTransaction: void;
  toggleIsDebitCardSectionVisible: void;
  toggleIsDepositCardSectionVisible: void;
  toggleIsOrderOfLibertySectionVisible: void;
  setCurrentWallet: Promise<void>;
  setIsDetecting: void;
  initWallet: Promise<void>;
  initServices: void;
  refreshWallet: Promise<void>;
  updateWalletAfterTxn: Promise<void>;
  waitWallet: Promise<boolean>;
  disconnectWallet: Promise<void>;
  getBasicPrices: Promise<void>;
  switchEthereumChain: Promise<void>;
  fetchTokensPriceByContractAddresses: Promise<PriceRecord>;
  recoverTokenPriceIfNeeded: Promise<SmallTokenInfo>;
  restoreNativeCurrency: Promise<void>;
  changeNativeCurrency: Promise<void>;
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
    if (!isFeatureEnabled('isGasListenerEnabled', state.networkInfo?.network)) {
      return;
    }

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
        commit('setRefreshError', err);
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
  async initWallet(
    { commit, dispatch, rootState },
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
      sendGlobalTopMessageEvent(
        (rootState.i18n?.t('errors.default', {
          code: CommonErrors.INIT_WALLET_ERROR
        }) as string) ?? 'Oh no. Something went wrong',
        'error'
      );
      throw err;
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
      const accounts = await state.provider.web3.eth.getAccounts();
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

      await dispatch('initServices');
      await dispatch('restoreNativeCurrency');
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
      if (isFeatureEnabled('isExplorerEnabled', state.networkInfo.network)) {
        if (payload.init) {
          if (
            isFeatureEnabled(
              'isOffchainExplorerEnabled',
              state.networkInfo.network
            )
          ) {
            console.log('Starting Offchain Explorer...');
            initOffchainExplorer(state.networkInfo.network);
          }
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
            },
            (addresses, nativeCurrency) =>
              dispatch('fetchTokensPriceByContractAddresses', {
                contractAddresses: addresses,
                currencies: nativeCurrency
              } as FetchTokenPricesByContractAddressesPayload),
            state.allTokens
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

      console.info('Wallet refreshed');
    } finally {
      state.isWalletLoading = false;
    }
  },
  initServices({ state, commit, dispatch, getters }): void {
    if (!ensureAccountStateIsSafe(state)) {
      throw new Error('account store is not initialized');
    }

    const coinGeckoAPIService = new CoinGeckoAPIService(
      state.currentAddress,
      state.networkInfo.network
    );
    commit('setCoinGeckoAPIService', coinGeckoAPIService);

    const theGraphAPIService = new TheGraphAPIService(
      state.currentAddress,
      state.networkInfo.network
    );
    commit('setTheGraphAPIService', theGraphAPIService);

    let smartTreasuryBonusBalanceExecutor:
      | ISmartTreasuryBonusBalanceExecutor
      | undefined;

    if (isFeatureEnabled('isTreasuryEnabled', state.networkInfo.network)) {
      const smartTreasuryOnChainService = new SmartTreasuryOnChainService(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );
      smartTreasuryBonusBalanceExecutor = smartTreasuryOnChainService;
      dispatch('treasury/setOnChainService', smartTreasuryOnChainService, {
        root: true
      });

      const smartTreasuryAPIService = new MoverAPISmartTreasuryService(
        state.currentAddress,
        state.networkInfo.network
      );
      dispatch('treasury/setAPIService', smartTreasuryAPIService, {
        root: true
      });
    }

    if (isFeatureEnabled('isSavingsEnabled', state.networkInfo.network)) {
      const savingsOnChainService = new SavingsOnChainService(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      )
        .setSmartTreasuryBonusBalanceExecutor(smartTreasuryBonusBalanceExecutor)
        .setAddTransactionToStoreHandler((tx) => dispatch('addTransaction', tx))
        .setEthPriceGetterHandler(() => getters.ethPrice);
      dispatch('savings/setOnChainService', savingsOnChainService, {
        root: true
      });

      const savingsAPIService = new MoverAPISavingsService(
        state.currentAddress,
        state.networkInfo.network
      );
      dispatch('savings/setAPIService', savingsAPIService, { root: true });
    }

    if (isFeatureEnabled('isSwapEnabled', state.networkInfo.network)) {
      const ZeroXService = new ZeroXAPIService(
        state.currentAddress,
        state.networkInfo.network
      );
      commit('setSwapAPIService', ZeroXService);

      const swapOnChainService = new SwapOnChainService(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      )
        .setSmartTreasuryBonusBalanceExecutor(smartTreasuryBonusBalanceExecutor)
        .setAddTransactionToStoreHandler((tx) => dispatch('addTransaction', tx))
        .setEthPriceGetterHandler(() => getters.ethPrice);
      commit('setSwapOnChainService', swapOnChainService);
    }

    if (isFeatureEnabled('isStakingUbtEnabled', state.networkInfo?.network)) {
      const stakingAPIService = new MoverAPIStakingUbtService(
        state.currentAddress,
        state.networkInfo.network
      );
      dispatch('stakingUBT/setAPIService', stakingAPIService, { root: true });

      const stakingOnChainService = new StakingUbtOnChainService(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );
      dispatch('stakingUBT/setOnChainService', stakingOnChainService, {
        root: true
      });
    }
  },
  async updateWalletAfterTxn({ state, dispatch }): Promise<void> {
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
      'isDebitCardEnabled',
      state?.networkInfo?.network
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
    Object.entries(localStorage)
      .map((x) => x[0])
      .filter((x) => x.startsWith('-walletlink'))
      .forEach((x) => localStorage.removeItem(x));
    clearOffchainExplorer();
    commit('clearWalletData');
    disconnectIntercomSession();
  },
  async switchEthereumChain(
    { state, rootState },
    networkInfo: NetworkInfo
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(state)) {
      return;
    }

    try {
      await (
        state.provider.web3.currentProvider as AbstractProvider
      )?.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkInfo.chainId.toString(16)}` }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await (
            state.provider.web3.currentProvider as AbstractProvider
          )?.request?.({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${networkInfo.chainId.toString(16)}`,
                chainName: networkInfo.name,
                rpcUrls: [networkInfo.rpcUrl],
                nativeCurrency: {
                  name: networkInfo.baseAsset.name,
                  symbol: networkInfo.baseAsset.symbol,
                  decimals: networkInfo.baseAsset.decimals
                },
                blockExplorerUrls: [networkInfo.explorer]
              }
            ]
          });
        } catch (err: any) {
          sendGlobalTopMessageEvent(
            (rootState.i18n?.t('errors.default', {
              code: CommonErrors.ADD_ETH_CHAIN_ERROR
            }) as string) ?? 'Oh no. Something went wrong',
            'error'
          );
          console.error(
            `Can't add ethereum network to the provider: ${errorToString(err)}`
          );
          Sentry.captureException(err);
        }
      } else {
        sendGlobalTopMessageEvent(
          (rootState.i18n?.t('errors.default', {
            code: CommonErrors.SWITCH_ETH_CHAIN_ERROR
          }) as string) ?? 'Oh no. Something went wrong',
          'error'
        );
        console.log(
          `Can't switch ethereum network to the provider: ${errorToString(
            error
          )}`
        );
      }
    }
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
  },
  toggleIsOrderOfLibertySectionVisible({ commit }): void {
    commit('toggleIsOrderOfLibertySectionVisible');
  },
  async fetchTokensPriceByContractAddresses(
    { state },
    {
      contractAddresses,
      currencies
    }: FetchTokenPricesByContractAddressesPayload
  ): Promise<PriceRecord> {
    let res: PriceRecord = {};
    const addresses = toArray(contractAddresses);

    try {
      if (state.coinGeckoAPIService === undefined) {
        throw new Error('CoinGecko API service is missing');
      }

      res = await state.coinGeckoAPIService.getPricesByContractAddress(
        contractAddresses,
        currencies
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'fetchTokensPriceByContractAddresses.actions.account.store',
        message: 'Failed to get token prices from CoinGecko',
        data: {
          error
        }
      });
    }

    if (!ensureAccountStateIsSafe(state)) {
      return res;
    }

    const contractAddressesOfStillMissingPrices = addresses.filter(
      (address) => res[address] === undefined
    );
    if (contractAddressesOfStillMissingPrices.length > 0) {
      try {
        if (state.theGraphAPIService === undefined) {
          throw new Error('TheGraph API service is missing');
        }

        const theGraphResult =
          await state.theGraphAPIService.getPricesByContractAddress(
            contractAddressesOfStillMissingPrices,
            currencies
          );
        res = { ...res, ...theGraphResult };
      } catch (error) {
        addSentryBreadcrumb({
          type:
            error instanceof NetworkFeatureNotSupportedError ||
            error instanceof CurrencyNotSupportedError
              ? 'debug'
              : 'error',
          category: 'fetchTokensPriceByContractAddresses.actions.account.store',
          message: 'Failed to get token prices from TheGraph',
          data: {
            error
          }
        });
      }
    }

    return res;
  },
  async recoverTokenPriceIfNeeded(
    { state, commit, dispatch },
    token: Token | TokenWithBalance
  ): Promise<Token> {
    if (token.priceUSD !== undefined && token.priceUSD !== '0') {
      return token;
    }

    const tokenPriceRecord = (await dispatch(
      'fetchTokensPriceByContractAddresses',
      {
        contractAddresses: token.address,
        currencies: state.nativeCurrency
      } as FetchTokenPricesByContractAddressesPayload
    )) as PriceRecord;

    const retrievedPrice = getAssetPriceFromPriceRecord(
      tokenPriceRecord,
      token.address,
      state.nativeCurrency
    );
    if (retrievedPrice !== undefined) {
      commit('setTokenNativePrice', {
        address: token.address,
        price: retrievedPrice
      });
      addSentryBreadcrumb({
        type: 'debug',
        category: 'recoverTokenPrice.actions.account.store',
        message: 'Recovered token price (allTokens)',
        data: {
          address: token.address,
          price: retrievedPrice
        }
      });

      return {
        ...token,
        priceUSD: retrievedPrice
      };
    }

    return token;
  },
  async restoreNativeCurrency({ commit, state, dispatch }): Promise<void> {
    if (!ensureAccountStateIsSafe(state)) {
      return;
    }

    const storedData = await getFromPersistStore<NativeCurrency>(
      state.currentAddress,
      state.networkInfo.network,
      'nativeCurrency'
    );
    if (storedData !== undefined) {
      commit('setNativeCurrency', storedData);
      return;
    }

    await dispatch('changeNativeCurrency', state.nativeCurrency);
  },
  async changeNativeCurrency(
    { state, dispatch, commit },
    nativeCurrency
  ): Promise<void> {
    commit('setNativeCurrency', nativeCurrency);
    if (!ensureAccountStateIsSafe(state)) {
      return;
    }

    await setToPersistStore(
      state.currentAddress,
      state.networkInfo.network,
      'nativeCurrency',
      nativeCurrency
    );

    await dispatch('refreshWallet', {
      injected: false,
      init: true
    } as RefreshWalletPayload);
  }
};

export type ActionType = typeof actions;
export default actions;
