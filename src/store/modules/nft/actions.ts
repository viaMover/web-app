import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import {
  claimAndExchangeUnexpectedMove,
  claimDice,
  claimOlympus,
  claimSweetAndSour,
  claimUnexpectedMove,
  exchangeUnexpectedMove,
  getDiceData,
  getOlympusData,
  getSweetAndSourData,
  getUnexpectedMoveData,
  getVaultsData
} from '@/services/chain';
import { claimVaults } from '@/services/chain/nft/vaults/vaults';
import { isFeatureEnabled } from '@/settings';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import {
  ChangePayload,
  ClaimPayload,
  DicePayload,
  NftAsset,
  NFTStoreState
} from '@/store/modules/nft/types';
import { ActionFuncs } from '@/store/types';
import { greaterThan, lessThan } from '@/utils/bigmath';
import { currentTimestamp } from '@/utils/time';

import { GetterType } from './getters';
import { MutationType } from './mutations';

type Actions = {
  loadNFTInfo: Promise<void>;
  refreshNftStats: Promise<void>;
  checkOlympusClaimable: boolean;
  claimOlympus: Promise<void>;
  claimVaults: Promise<void>;
  claimDice: Promise<void>;
  claimSweetAndSour: Promise<void>;
  claimUnexpectedMove: Promise<void>;
  claimAndExchangeUnexpectedMove: Promise<void>;
  exchangeUnexpectedMove: Promise<void>;
};

const actions: ActionFuncs<Actions, NFTStoreState, MutationType, GetterType> = {
  async loadNFTInfo({ rootState, commit, dispatch }): Promise<void> {
    commit('setIsLoading', true);
    try {
      const nftAssets: Array<NftAsset> = [
        {
          name: 'Dice Project',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.dice.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Vaults'
            }) as string,
            src: require('@/assets/images/Dice_Project_More@1x.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/Dice_Project_More@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/Dice_Project_More@1x.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/Dice_Project_More@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Vaults'
            }) as string,
            src: require('@/assets/images/Dice_Project@1x.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/Dice_Project@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/Dice_Project@1x.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/Dice_Project@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Moving With Olympus',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.movingWithOlympus.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Mowing With Olympus'
            }) as string,
            src: require('@/assets/images/MovingWithOlympus.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympus@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/MovingWithOlympus.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympus@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Mowing With Olympus'
            }) as string,
            src: require('@/assets/images/MovingWithOlympusBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympusBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/MovingWithOlympusBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/MovingWithOlympusBig@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Sweet & Sour',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.sweetAndSour.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Sweet & Sour'
            }) as string,
            src: require('@/assets/images/SweetAndSour.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSour@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SweetAndSour.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSour@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Sweet & Sour'
            }) as string,
            src: require('@/assets/images/SweetAndSourBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSourBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SweetAndSourBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SweetAndSourBig@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Unexpected Move',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.unexpectedMove.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Unexpected Move'
            }) as string,
            src: require('@/assets/images/UnexpectedMove.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMove@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/UnexpectedMove.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMove@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Unexpected Move'
            }) as string,
            src: require('@/assets/images/UnexpectedMoveBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMoveBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/UnexpectedMoveBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/UnexpectedMoveBig@2x.webp')
              }
            ]
          }
        },
        {
          name: 'Vaults',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.vaults.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Vaults'
            }) as string,
            src: require('@/assets/images/Vaults.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/Vaults@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/Vaults.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/Vaults@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Vaults'
            }) as string,
            src: require('@/assets/images/VaultsBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/VaultsBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/VaultsBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/VaultsBig@2x.webp')
              }
            ]
          }
        }
      ];

      if (isFeatureEnabled('isSwapPassportEnabled')) {
        nftAssets.push({
          name: 'Swap Passport',
          description: rootState.i18n?.t(
            'NFTs.txtNFTs.swapPassport.description'
          ) as string,
          meta: [],
          picture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Swap Passport'
            }) as string,
            src: require('@/assets/images/SwapPassport.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassport@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SwapPassport.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassport@2x.webp')
              }
            ]
          },
          bigPicture: {
            alt: rootState.i18n?.t('NFTs.txtAssetAlt', {
              name: 'Swap Passport'
            }) as string,
            src: require('@/assets/images/SwapPassportBig.png'),
            sources: [
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassportBig@2x.png')
              }
            ],
            webpSources: [
              { src: require('@/assets/images/SwapPassportBig.webp') },
              {
                variant: '2x',
                src: require('@/assets/images/SwapPassportBig@2x.webp')
              }
            ]
          }
        });
      }
      commit('setNFTs', nftAssets);
      await dispatch('refreshNftStats');
    } finally {
      commit('setIsLoading', false);
    }
  },
  async refreshNftStats({ rootState, commit }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    const unexpectedMoveDataPromise = getUnexpectedMoveData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    const sweetAndSourDataPromise = getSweetAndSourData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    const olympusDataPromise = getOlympusData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    const vaultsDataPromise = getVaultsData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    const diceDataPromise = getDiceData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    try {
      const [
        unexpectedMoveRes,
        sweetAndSourRes,
        olympusRes,
        diceRes,
        vaultsRes
      ] = await Promise.allSettled([
        unexpectedMoveDataPromise,
        sweetAndSourDataPromise,
        olympusDataPromise,
        diceDataPromise,
        vaultsDataPromise
      ]);

      if (unexpectedMoveRes.status === 'fulfilled') {
        commit('setUnexpectedMoveData', unexpectedMoveRes.value);
      } else {
        logger.error(
          "Can't get data about Unexpected Move",
          unexpectedMoveRes.reason
        );
        Sentry.captureException("Can't get data about Unexpected Move");
      }

      if (sweetAndSourRes.status === 'fulfilled') {
        commit('setSweetAndSourData', sweetAndSourRes.value);
      } else {
        logger.error(
          "Can't get data about Sweet And Sour",
          sweetAndSourRes.reason
        );
        Sentry.captureException("Can't get data about Sweet And Sour");
      }

      if (olympusRes.status === 'fulfilled') {
        commit('setOlympusData', olympusRes.value);
      } else {
        logger.error("Can't get data about Olympus", olympusRes.reason);
        Sentry.captureException("Can't get data about Olympus");
      }

      if (diceRes.status === 'fulfilled') {
        commit('setDiceData', diceRes.value);
      } else {
        logger.error("Can't get data about Dice", diceRes.reason);
        Sentry.captureException("Can't get data about Dice");
      }

      if (vaultsRes.status === 'fulfilled') {
        if (vaultsRes.value !== undefined) {
          commit('setVaultsData', vaultsRes.value);
        }
      } else {
        logger.error("Can't get data about Vaults", vaultsRes.reason);
        Sentry.captureException("Can't get data about Vaults");
      }
    } catch (err) {
      console.error("can't load nft's data", err);
      Sentry.captureException(err);
    }
  },
  checkOlympusClaimable({ state }): boolean {
    return (
      lessThan(currentTimestamp(), state.OlympusEndTs) &&
      greaterThan(currentTimestamp(), state.OlympusStartTs)
    );
  },
  async claimOlympus({ rootState }, payload: ChangePayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimOlympus(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimVaults({ rootState }, payload: ChangePayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimVaults(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimDice({ rootState }, payload: DicePayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimDice(
      payload.diceType,
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimSweetAndSour({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimSweetAndSour(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimUnexpectedMove(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimAndExchangeUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await claimAndExchangeUnexpectedMove(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  },
  async exchangeUnexpectedMove(
    { rootState },
    payload: ChangePayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await exchangeUnexpectedMove(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  }
};

export type ActionType = typeof actions;
export default actions;
