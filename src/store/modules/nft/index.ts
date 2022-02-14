import { isFeatureEnabled, isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { NftAssetId, NFTStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,

    movingWithOlympus: {
      id: NftAssetId.MovingWithOlympus,
      balance: '0',
      name: 'Moving With Olympus',
      meta: {
        startTs: '0',
        endTs: '0',
        totalClaimed: '0'
      },
      picture: {
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
    unexpectedMove: {
      id: NftAssetId.UnexpectedMove,
      balance: '0',
      name: 'Unexpected Move',
      picture: {
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
      },
      meta: {
        totalAmount: '0',
        totalClaimed: '0',
        totalExchanged: '0'
      }
    },
    sweetAndSour: {
      id: NftAssetId.SweetAndSour,
      balance: '0',
      name: 'Sweet & Sour',
      meta: {
        totalClaimed: '0',
        totalAmount: '0'
      },
      picture: {
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
    vaults: {
      id: NftAssetId.Vaults,
      balance: '0',
      name: 'Vaults',
      meta: {
        totalAmount: '0',
        totalClaimed: '0'
      },
      picture: {
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
    },
    dice: {
      id: NftAssetId.Dice,
      balance: '0',
      name: 'Dice Project',
      meta: {
        totalClaimed: '0'
      },
      picture: {
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
    swapPassport: isFeatureEnabled('isSwapPassportEnabled')
      ? {
          id: NftAssetId.SwapPassport,
          name: 'Swap Passport',
          balance: '0',
          meta: undefined,
          picture: {
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
        }
      : undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<NFTStoreState, ActionType, GetterType, MutationType>;
