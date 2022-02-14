import { Token } from '@/wallet/types';

import { Skin } from '../debit-card/types';

export enum Modal {
  SearchToken = 'search-token-modal',
  Swap = 'swap-modal',
  SearchSkin = 'search-skin-modal'
}

export enum SwapType {
  getMove = 'getMove',
  simple = ''
}

export interface TModalParams {
  [Modal.SearchToken]: {
    payloadType: {
      useWalletTokens: boolean;
      excludeTokens: Array<Token>;
      treasuryOnly: boolean;
      forceTokenArray: Array<Token>;
      hideCloseButton: boolean;
    };
    returnType: Token | undefined;
  };
  [Modal.SearchSkin]: {
    payloadType: {
      hideCloseButton: boolean;
    };
    returnType: Skin | undefined;
  };
  [Modal.Swap]: {
    payloadType:
      | {
          swapType: SwapType;
        }
      | undefined;
    returnType: undefined;
  };
}

export type TModalKey = keyof TModalParams;
export type TModalPayload<K extends TModalKey> = TModalParams[K]['payloadType'];
export type TModalReturn<K extends TModalKey> = TModalParams[K]['returnType'];

export type ModalState<K extends TModalKey> = {
  isDisplayed: boolean;
  isVisible: boolean;
  stackDepth: number;
  waitForResult: boolean;
  needGasListener: boolean;

  payload?: TModalPayload<K>;
  resolver?: (args: TModalReturn<K>) => Promise<TModalReturn<K>>;
};

export type ModalsStoreState = {
  state: Record<TModalKey, ModalState<TModalKey>>;
  stack: Array<TModalKey>;
};
