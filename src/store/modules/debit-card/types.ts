export type DebitCardStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  availableSkinIds: Array<string>;
  currentSkin: Skin;
  cardState: CardState;
};

export type Skin = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  nftAddress: string | undefined;
};

export type CardState = 'active' | 'frozen' | 'pending' | 'expired';

export type ValidateOrOrderCardParams = {
  email: string;
};
