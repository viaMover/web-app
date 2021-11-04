import { GetterTree } from 'vuex';

import dayjs from 'dayjs';
import Fuse from 'fuse.js';

import { RootStoreState } from '../../types';
import {
  DebitCardStoreState,
  EventHistoryItem,
  EventHistoryItemGroup,
  EventHistoryItemMinimal,
  Skin,
  SkinMinimal
} from './types';

export default {
  availableSkins(state, getters, rootState): Array<Skin> {
    return state.availableSkins.map(mapSkin(rootState));
  },
  currentSkin(state, getters, rootState): Skin {
    return mapSkin(rootState)(state.currentSkin);
  },
  cardStateText(state, getters, rootState): string {
    if (rootState.i18n?.te(`debitCard.state.${state.cardState}`)) {
      return rootState.i18n.t(`debitCard.state.${state.cardState}`) as string;
    }

    return state.cardState;
  },
  searchInAvailableSkins(state, getters): (searchTerm: string) => Array<Skin> {
    const searchOptions = {
      keys: [
        {
          name: 'name',
          weight: 1
        },
        {
          name: 'symbol',
          weight: 2.5
        }
      ],
      findAllMatches: true,
      threshold: 0,
      shouldSort: true
    };
    const index = Fuse.createIndex(searchOptions.keys, getters.availableSkins);
    const skinSearcher = new Fuse(getters.availableSkins, searchOptions, index);

    return (searchTerm: string) => {
      const searchTermProcessed = searchTerm.trim().toLowerCase();
      if (searchTermProcessed === '') {
        return getters.availableSkins;
      }

      if (skinSearcher === undefined) {
        return (getters.availableSkins as Array<Skin>).filter(
          (s: Skin) =>
            s.symbol.toLowerCase().includes(searchTermProcessed) ||
            s.name.toLowerCase().includes(searchTermProcessed)
        );
      }

      return skinSearcher.search(searchTerm).map((res) => res.item);
    };
  },
  actionHistoryGroupedByDay(
    state,
    getters,
    rootState
  ): Array<EventHistoryItemGroup> {
    const groupsByDay = state.eventHistory.reduce(
      (
        res: Record<number, EventHistoryItemGroup>,
        item: EventHistoryItemMinimal
      ): Record<number, EventHistoryItemGroup> => {
        const mappedItem = mapHistoryEventItem(rootState)(item);

        const groupKey = dayjs.unix(item.timestamp).startOf('day').unix();
        if (res[groupKey] !== undefined) {
          const retVal = { ...res[groupKey] };
          retVal.events.push(mappedItem);

          return { ...res, [groupKey]: retVal };
        }

        return {
          ...res,
          [groupKey]: { timestamp: groupKey, events: [mappedItem] }
        };
      },
      {}
    );
    return Object.values(groupsByDay);
  }
} as GetterTree<DebitCardStoreState, RootStoreState>;

const mapSkin = (rootState: RootStoreState): ((skin: SkinMinimal) => Skin) => {
  return (skin: SkinMinimal): Skin => {
    let description = '';
    if (
      rootState.i18n?.te(`debitCard.changeSkin.skins.${skin.id}.description`)
    ) {
      description = rootState.i18n?.t(
        `debitCard.changeSkin.skins.${skin.id}.description`
      ) as string;
    }

    let name = skin.symbol;
    if (rootState.i18n?.te(`debitCard.changeSkin.skins.${skin.id}.name`)) {
      name = rootState.i18n?.t(
        `debitCard.changeSkin.skins.${skin.id}.name`
      ) as string;
    }

    let pictureAlt = name;
    if (rootState.i18n?.te('debitCard.changeSkin.skins.txtSkinAlt')) {
      pictureAlt = rootState.i18n?.t('debitCard.changeSkin.skins.txtSkinAlt', {
        name: name
      }) as string;
    }

    return {
      id: skin.id,
      description: description,
      name: name,
      symbol: skin.symbol,
      nftAddress: skin.nftAddress,
      color: skin.color,
      picture: {
        alt: pictureAlt,
        src: require(`@/assets/images/card-skins/${skin.id}@1x.png`),
        sources: [
          {
            src: require(`@/assets/images/card-skins/${skin.id}@2x.png`),
            variant: '2x'
          }
        ]
      },
      previewPicture: {
        alt: pictureAlt,
        src: require(`@/assets/images/card-skins/${skin.id}-preview@1x.png`),
        sources: [
          {
            src: require(`@/assets/images/card-skins/${skin.id}-preview@2x.png`),
            variant: '2x'
          }
        ]
      }
    };
  };
};

const mapHistoryEventItem = (
  rootState: RootStoreState
): ((item: EventHistoryItemMinimal) => EventHistoryItem) => {
  return (item: EventHistoryItemMinimal): EventHistoryItem => {
    let icon = '🐣';
    switch (item.type) {
      case 'order_process_started':
        icon = '🐣';
        break;
      case 'kyc_process_started':
        icon = '🤖';
        break;
      case 'documents_verified':
        icon = '💌';
        break;
      case 'card_shipped':
        icon = '🚁';
        break;
    }

    let description = item.type as string;
    if (rootState.i18n?.te(`debitCard.txtHistoryMessage.${item.type}`)) {
      description = rootState.i18n?.t(
        `debitCard.txtHistoryMessage.${item.type}`
      ) as string;
    }

    return {
      timestamp: item.timestamp,
      description: description,
      icon: icon
    };
  };
};
