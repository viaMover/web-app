import { Network } from '@/utils/networkTypes';

export type GlobalSettings = Array<Network> | boolean;
export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: GlobalSettings;
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

export const isConsoleEnabled = (): boolean => {
  return process.env.VUE_APP_CONSOLE_LOGS === 'true';
};

const values: Globals = {
  isSavingsOverviewSomeFieldsEnabled: false,
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
  isSavingsPlusEnabled: false,
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
