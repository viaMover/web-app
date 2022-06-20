import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';
import { captureException } from '@sentry/vue';

import {
  claimAndExchangeUnexpectedMove,
  claimBaseledgerStakingOG,
  claimDice,
  claimOlympus,
  claimOrderOfLiberty,
  claimSweetAndSour,
  claimUnexpectedMove,
  exchangeUnexpectedMove,
  getBaseledgerStakingOGData,
  getDiceData,
  getOlympusData,
  getOrderOfLibertyData,
  getSweetAndSourData,
  getUnexpectedMoveData,
  getVaultsData
} from '@/services/chain';
import { claimVaults } from '@/services/chain/nft/vaults/vaults';
import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { ENSAPIService } from '@/services/v2/api/ens';
import { UNSAPIService } from '@/services/v2/api/uns';
import { ENSOnChainService } from '@/services/v2/on-chain/ens';
import { UNSOnChainService } from '@/services/v2/on-chain/uns';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import {
  ChangePayload,
  ClaimPayload,
  DicePayload,
  NFTStoreState,
  OrderOfLibertyPayload
} from '@/store/modules/nft/types';
import { ActionFuncs } from '@/store/types';
import { greaterThan, lessThan } from '@/utils/bigmath';
import { currentTimestamp } from '@/utils/time';

import { GetterType } from './getters';
import { MutationType } from './mutations';

type Actions = {
  loadNFTInfo: Promise<void>;
  fetchOlympusData: Promise<void>;
  fetchUnexpectedMoveData: Promise<void>;
  fetchSweetAndSourData: Promise<void>;
  fetchVaultsData: Promise<void>;
  fetchDiceData: Promise<void>;
  fetchBaseledgerStakingOGData: Promise<void>;
  checkOlympusClaimable: boolean;
  claimOlympus: Promise<void>;
  claimVaults: Promise<void>;
  claimDice: Promise<void>;
  claimSweetAndSour: Promise<void>;
  claimUnexpectedMove: Promise<void>;
  claimAndExchangeUnexpectedMove: Promise<void>;
  exchangeUnexpectedMove: Promise<void>;
  fetchOrderOfLibertyData: Promise<void>;
  claimOrderOfLiberty: Promise<void>;
  claimBaseledgerStakingOG: Promise<void>;
  fetchENSData: Promise<void>;
  fetchUNSData: Promise<void>;
};

const actions: ActionFuncs<Actions, NFTStoreState, MutationType, GetterType> = {
  async loadNFTInfo({ state, rootState, commit, dispatch }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const network = rootState.account.networkInfo.network;

    if (!isFeatureEnabled('isNftDropsEnabled', network)) {
      return;
    }

    commit('setIsLoading', true);

    const nftPromises: Array<Promise<void>> = [];
    if (state.orderOfLiberty.networks.includes(network)) {
      nftPromises.push(dispatch('fetchOrderOfLibertyData'));
    }
    if (state.unexpectedMove.networks.includes(network)) {
      nftPromises.push(dispatch('fetchUnexpectedMoveData'));
    }
    if (state.sweetAndSour.networks.includes(network)) {
      nftPromises.push(dispatch('fetchSweetAndSourData'));
    }
    if (state.movingWithOlympus.networks.includes(network)) {
      nftPromises.push(dispatch('fetchOlympusData'));
    }
    if (state.vaults.networks.includes(network)) {
      nftPromises.push(dispatch('fetchVaultsData'));
    }
    if (state.dice.networks.includes(network)) {
      nftPromises.push(dispatch('fetchDiceData'));
    }
    if (state.baseledgerStakingOG.networks.includes(network)) {
      nftPromises.push(dispatch('fetchBaseledgerStakingOGData'));
    }
    if (state.ens.networks.includes(network)) {
      nftPromises.push(dispatch('fetchENSData'));
    }
    if (state.uns.networks.includes(network)) {
      nftPromises.push(dispatch('fetchUNSData'));
    }

    await Promise.allSettled(nftPromises);

    commit('setIsLoading', false);
  },
  async fetchENSData({ rootState, state, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      addSentryBreadcrumb({
        type: 'warn',
        category: 'fetchENSData.action.nft.store',
        message: 'Account state is not loaded yet'
      });
      return;
    }

    try {
      let onChainService = state.ensOnChainService;
      if (onChainService === undefined) {
        onChainService = new ENSOnChainService(
          rootState.account.currentAddress,
          rootState.account.networkInfo.network,
          rootState.account.provider.web3
        );
        commit('setENSOnChainService', onChainService);
      }

      const ensOwnDomainName = await onChainService.getOwnDomainName();
      if (ensOwnDomainName !== undefined) {
        let apiService = state.ensAPIService;
        if (apiService === undefined) {
          apiService = new ENSAPIService(
            rootState.account.currentAddress,
            rootState.account.networkInfo.network
          );
          commit('setENSAPIService', apiService);
        }

        console.debug('ens name', ensOwnDomainName);
        const tokenId = onChainService.getERC721TokenId(ensOwnDomainName);
        console.debug('tokenId', tokenId);
        const meta = await apiService.getERC721Meta(tokenId);
        commit('setENSData', meta);
      }
    } catch (error) {
      if (error instanceof NetworkFeatureNotSupportedError) {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'fetchENSData.action.nft.store',
          message: error.message
        });
        return;
      }

      captureException(error);
    }
  },
  async fetchUNSData({ rootState, state, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      addSentryBreadcrumb({
        type: 'warn',
        category: 'fetchUNSData.action.nft.store',
        message: 'Account state is not loaded yet'
      });
      return;
    }

    try {
      let onChainService = state.unsOnChainService;
      if (onChainService === undefined) {
        onChainService = new UNSOnChainService(
          rootState.account.currentAddress,
          rootState.account.networkInfo.network,
          rootState.account.provider.web3
        );
        commit('setUNSOnChainService', onChainService);
      }

      const balance = await onChainService.balanceOf();
      if (greaterThan(balance, 0)) {
        const tokenId = await onChainService.getTokenId();
        const tokenMetaURI = await onChainService.getTokenURI(tokenId);

        let apiService = state.unsAPIService;
        if (apiService === undefined) {
          apiService = new UNSAPIService();
          commit('setUNSAPIService', apiService);
        }

        const meta = await apiService.getDomainMetadata(tokenMetaURI);
        commit('setUNSData', meta);
      }
    } catch (error) {
      if (error instanceof NetworkFeatureNotSupportedError) {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'fetchUNSData.action.nft.store',
          message: error.message
        });
        return;
      }

      captureException(error);
    }
  },
  async fetchOlympusData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getOlympusData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setOlympusData', data);
    } catch (e) {
      logger.error("Can't get data about Olympus", e);
      Sentry.captureException(e);
    }
  },
  async fetchSweetAndSourData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getSweetAndSourData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setSweetAndSourData', data);
    } catch (e) {
      logger.error("Can't get data about Sweet and Sour", e);
      Sentry.captureException(e);
    }
  },
  async fetchVaultsData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getVaultsData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setVaultsData', data);
    } catch (e) {
      logger.error("Can't get data about Vaults", e);
      Sentry.captureException(e);
    }
  },
  async fetchUnexpectedMoveData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getUnexpectedMoveData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setUnexpectedMoveData', data);
    } catch (e) {
      logger.error("Can't get data about Unexpected Move", e);
      Sentry.captureException(e);
    }
  },
  async fetchDiceData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getDiceData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setDiceData', data);
    } catch (e) {
      logger.error("Can't get data about Dice", e);
      Sentry.captureException("Can't get data about Dice");
    }
  },
  async fetchBaseledgerStakingOGData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getBaseledgerStakingOGData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setBaseledgerStakingOGData', data);
    } catch (e) {
      logger.error("Can't get data about baseledger staking OG", e);
      Sentry.captureException("Can't get data about baseledger staking OG");
    }
  },
  async claimBaseledgerStakingOG(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimBaseledgerStakingOG(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  checkOlympusClaimable({ state }): boolean {
    return (
      lessThan(currentTimestamp(), state.movingWithOlympus.meta.endTs) &&
      greaterThan(currentTimestamp(), state.movingWithOlympus.meta.startTs)
    );
  },
  async claimOlympus({ rootState }, payload: ChangePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimOlympus(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async claimVaults({ rootState }, payload: ChangePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimVaults(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async claimDice({ rootState }, payload: DicePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimDice(
      payload.diceType,
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async claimSweetAndSour({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimSweetAndSour(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async claimUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimUnexpectedMove(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async claimAndExchangeUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimAndExchangeUnexpectedMove(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async exchangeUnexpectedMove(
    { rootState },
    payload: ChangePayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await exchangeUnexpectedMove(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.changeStep
    );
  },
  async fetchOrderOfLibertyData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getOrderOfLibertyData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setOrderOfLibertyData', data);
    } catch (e) {
      logger.error("Can't get data about The Order of Liberty NFT", e);
      Sentry.captureException(e);
    }
  },
  async claimOrderOfLiberty(
    { rootState },
    payload: OrderOfLibertyPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    await claimOrderOfLiberty(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      payload.selectedPrice,
      payload.changeStep
    );
  }
};

export type ActionType = typeof actions;
export default actions;
