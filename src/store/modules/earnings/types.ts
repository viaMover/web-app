import { EarningsEthereumStoreState } from './modules/ethereum/types';
import { EarningsOlympusStoreState } from './modules/olympus/types';

export type EarningsStoreState = {
  [EarningsProviderName.Ethereum]?: EarningsEthereumStoreState;
  [EarningsProviderName.Olympus]?: EarningsOlympusStoreState;
};

export enum EarningsProviderName {
  Ethereum = 'ethereum',
  Olympus = 'olympus'
}
