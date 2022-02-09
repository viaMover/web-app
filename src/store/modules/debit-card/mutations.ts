import { MutationTree } from 'vuex';

import {
  CardInfo,
  CardState,
  DebitCardStoreState,
  EventHistoryItemMinimal,
  OrderState,
  SkinMinimal
} from './types';

export default {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setIsInitialized(state, isInitialized: boolean): void {
    state.isInitialized = isInitialized;
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
  },
  setEmail(state, email: string): void {
    state.email = email;
  },
  setEmailHash(state, emailHash: string): void {
    state.emailHash = emailHash;
  },
  setEmailSignature(state, emailSignature: string): void {
    state.emailSignature = emailSignature;
  },
  setPhoneNumber(state, phoneNumber: string): void {
    state.phoneNumber = phoneNumber;
  },
  setOrderState(state, orderState: OrderState | undefined): void {
    state.orderState = orderState;
  },
  setKycLink(state, link: string | undefined): void {
    state.kycLink = link;
  },
  setWxBTRFLYrealIndex(state, realIndex: string): void {
    state.wxBTRFLYrealIndex = realIndex;
  }
} as MutationTree<DebitCardStoreState>;
