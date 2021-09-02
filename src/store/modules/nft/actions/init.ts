/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { checkAccountStateIsReady } from './../../account/utils/state';
import { ActionTree } from 'vuex';
import * as Sentry from '@sentry/vue';

import {
  getOlympusData,
  getSweetAndSourData,
  getUnexpectedMoveData
} from '@/services/chain';
import { RootStoreState } from '@/store/types';
import { NftAsset, NFTStoreState } from './../types';
import { isFeatureEnabled } from '@/settings';

export default {
  async loadNFTInfo({ rootState, commit, dispatch }): Promise<void> {
    commit('setIsLoading', true);

    const nftAssets: Array<NftAsset> = [
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
    commit('setIsLoading', false);
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

    const olympusPromise = getOlympusData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    try {
      const [unexpectedMoveData, sweetAndSourData, olympusData] =
        await Promise.all([
          unexpectedMoveDataPromise,
          sweetAndSourDataPromise,
          olympusPromise
        ]);
      commit('setUnexpectedMoveData', unexpectedMoveData);
      commit('setSweetAndSourData', sweetAndSourData);
      commit('setOlympusData', olympusData);
    } catch (err) {
      console.error("can't load nft's data", err);
      Sentry.captureException(err);
    }
  }
} as ActionTree<NFTStoreState, RootStoreState>;
