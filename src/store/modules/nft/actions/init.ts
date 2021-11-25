/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { ActionTree } from 'vuex';

import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import {
  getDiceData,
  getOlympusData,
  getSweetAndSourData,
  getUnexpectedMoveData,
  getVaultsData,
  VaultsData
} from '@/services/chain';
import { isFeatureEnabled } from '@/settings';
import { RootStoreState } from '@/store/types';

import { checkAccountStateIsReady } from './../../account/utils/state';
import { NftAsset, NFTStoreState } from './../types';

export default {
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
  }
} as ActionTree<NFTStoreState, RootStoreState>;
