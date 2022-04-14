import { Network } from '@/utils/networkTypes';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

export type GlobalSettings = Array<Network> | boolean;
export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: GlobalSettings;
  isSavingsPlusOverviewSomeFieldsEnabled: GlobalSettings;
  isSwapPassportEnabled: GlobalSettings;
  isReleaseRadarEnabled: GlobalSettings;
  isDebitCardEnabled: GlobalSettings;
  isGovernanceMarkdownEnabled: GlobalSettings;
  isBondsEnabled: GlobalSettings;
  isNibbleShopEnabled: GlobalSettings;
  isIntercomEnabled: GlobalSettings;
  isSavingsMonthlyChartEnabled: GlobalSettings;
  isTreasuryMonthlyChartEnabled: GlobalSettings;
  isTreasuryEnabled: GlobalSettings;
  isSavingsEnabled: GlobalSettings;
  isSwapEnabled: GlobalSettings;
  isExplorerEnabled: GlobalSettings;
  isOffchainExplorerEnabled: GlobalSettings;
  isEarningsEnabled: GlobalSettings;
  isGovernanceEnabled: GlobalSettings;
  isNftDropsEnabled: GlobalSettings;
  isEarningsEthereumEnabled: GlobalSettings;
  isEarningsOlympusEnabled: GlobalSettings;
  isDebitCardTopUpEnabled: GlobalSettings;
  isDebitCardChangeSkinEnabled: GlobalSettings;
  isVaultsRaceEnabled: GlobalSettings;
  isTreasuryClaimAndBurnMOBOEnabled: GlobalSettings;
  isTreasuryClaimAndBurnMOVEEnabled: GlobalSettings;
  isSavingsPlusEnabled: GlobalSettings;
  isMultiChainMastheadEnabled: GlobalSettings;
  isHomeSwapModalEnabled: GlobalSettings;
  isOrderOfLibertyNFTEnabled: GlobalSettings;
  isMoverAPISavingsServiceFieldsReducerEnabled: GlobalSettings;
  isMoverAPISmartTreasuryServiceFieldsReducerEnabled: GlobalSettings;
  isGasListenerEnabled: GlobalSettings;
  isStakingUbtEnabled: GlobalSettings;
  isStakingUbtFieldReducerEnabled: GlobalSettings;
}

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// enables console output in browser developer tools
export const isConsoleEnabled = (): boolean => {
  return process.env.VUE_APP_CONSOLE_LOGS === 'true';
};

const values: Globals = {
  isSavingsOverviewSomeFieldsEnabled: false,
  isSavingsPlusOverviewSomeFieldsEnabled: false,
  isSwapPassportEnabled: false,
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: [Network.mainnet],
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isNibbleShopEnabled: [Network.mainnet],
  isIntercomEnabled: !isDevelop(),
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isDebitCardTopUpEnabled: [Network.mainnet],
  isDebitCardChangeSkinEnabled: false,
  isTreasuryEnabled: [Network.mainnet],
  isSavingsEnabled: [Network.mainnet],
  isSwapEnabled: [Network.mainnet, Network.fantom, Network.polygon],
  isExplorerEnabled: [
    Network.mainnet,
    Network.binance,
    Network.binanceTest,
    Network.kovan,
    Network.ropsten,
    Network.rinkeby,
    Network.avalanche,
    Network.fantom,
    Network.polygon
  ],
  isOffchainExplorerEnabled: [Network.mainnet],
  isEarningsEnabled: false,
  isGovernanceEnabled: [Network.mainnet],
  isNftDropsEnabled: [Network.mainnet],
  isEarningsEthereumEnabled: false,
  isEarningsOlympusEnabled: false,
  isVaultsRaceEnabled: false,
  isTreasuryClaimAndBurnMOBOEnabled: [Network.mainnet],
  isTreasuryClaimAndBurnMOVEEnabled: false,
  isSavingsPlusEnabled: [Network.mainnet, Network.polygon, Network.fantom],
  isMultiChainMastheadEnabled: true,
  isHomeSwapModalEnabled: true,
  isOrderOfLibertyNFTEnabled: [
    Network.mainnet,
    Network.polygon,
    Network.fantom
  ],
  isMoverAPISavingsServiceFieldsReducerEnabled: true,
  isMoverAPISmartTreasuryServiceFieldsReducerEnabled: true,
  isGasListenerEnabled: [Network.mainnet],
  isStakingUbtEnabled: [Network.mainnet],
  isStakingUbtFieldReducerEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(
  key: T,
  network?: Network
): boolean => {
  const settings = values[key] as GlobalSettings;
  if (typeof settings === 'boolean') {
    return settings;
  }
  if (network === undefined) {
    return true;
  }
  return settings.includes(network);
};

export const stableCoinForNetwork = (
  network: Network
): SmallTokenInfoWithIcon | undefined => {
  return networkStableCoinMap[network];
};

type NetworkStableCoinMap<T> = {
  [K in keyof T]: SmallTokenInfoWithIcon | undefined;
};

const networkStableCoinMap: NetworkStableCoinMap<typeof Network> = {
  [Network.mainnet]: getUSDCAssetData(Network.mainnet),
  [Network.polygon]: getUSDCAssetData(Network.polygon),
  [Network.fantom]: getUSDCAssetData(Network.fantom),
  [Network.binance]: undefined,
  [Network.binanceTest]: undefined,
  [Network.kovan]: undefined,
  [Network.rinkeby]: undefined,
  [Network.ropsten]: undefined,
  [Network.avalanche]: undefined,
  [Network.arbitrum]: undefined,
  [Network.celo]: undefined,
  [Network.optimism]: undefined
};
