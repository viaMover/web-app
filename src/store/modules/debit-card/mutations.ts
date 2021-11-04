import { MutationTree } from 'vuex';

import {
  CardInfo,
  CardState,
  DebitCardStoreState,
  EventHistoryItemMinimal,
  SkinMinimal
} from './types';

export default {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setError(state, error: string | Error | undefined): void {
    state.error = error;
  },
  setCardState(state, cardState: CardState): void {
    state.cardState = cardState;
  },
  setCardEventHistory(
    state,
    eventHistoryItems: Array<EventHistoryItemMinimal>
  ): void {
    state.eventHistory = eventHistoryItems;
  },
  setCardInfo(state, info: CardInfo): void {
    state.cardInfo = info;
  },
  setCurrentSkin(state, skin: SkinMinimal): void {
    state.currentSkin = skin;
  },
  setAvailableSkins(state, skins: Array<SkinMinimal>): void {
    state.availableSkins = skins;
  },
  setLoadingPromise(state, promise: Promise<void> | undefined): void {
    state.loadingPromise = promise;
  }
} as MutationTree<DebitCardStoreState>;
