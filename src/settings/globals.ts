import { Network } from '@/utils/networkTypes';

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
  isTokenListAvailable: GlobalSettings;
  isTransactionsListAvailable: GlobalSettings;
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
  isMoverAPISavingsServiceFieldsReducerEnabled: GlobalSettings;
  isMoverAPISmartTreasuryServiceFieldsReducerEnabled: GlobalSettings;
  isMoverAPISavingsPlusServiceFieldsReducerEnabled: GlobalSettings;
  isGasListenerEnabled: GlobalSettings;
  isStakingUbtEnabled: GlobalSettings;
  isStakingUbtFieldReducerEnabled: GlobalSettings;
  hideSlippageSelector: GlobalSettings;
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
  isSwapEnabled: [
    Network.mainnet,
    Network.fantom,
    Network.polygon,
    Network.avalanche,
    Network.binance,
    Network.arbitrum,
    Network.optimism
  ],
  isExplorerEnabled: [
    Network.mainnet,
    Network.binance,
    Network.binanceTest,
    Network.kovan,
    Network.ropsten,
    Network.rinkeby,
    Network.avalanche,
    Network.fantom,
    Network.polygon,
    Network.arbitrum,
    Network.optimism
  ],
  isTokenListAvailable: [
    Network.mainnet,
    Network.binance,
    Network.binanceTest,
    Network.kovan,
    Network.ropsten,
    Network.rinkeby,
    Network.avalanche,
    Network.fantom,
    Network.polygon,
    Network.optimism
  ],
  isTransactionsListAvailable: [
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
  isNftDropsEnabled: [Network.mainnet, Network.polygon, Network.fantom],
  isEarningsEthereumEnabled: false,
  isEarningsOlympusEnabled: false,
  isVaultsRaceEnabled: false,
  isTreasuryClaimAndBurnMOBOEnabled: [Network.mainnet],
  isTreasuryClaimAndBurnMOVEEnabled: false,
  isSavingsPlusEnabled: [
    Network.mainnet,
    Network.polygon,
    Network.fantom,
    Network.avalanche,
    Network.binance,
    Network.arbitrum,
    Network.optimism
  ],
  isMultiChainMastheadEnabled: true,
  isHomeSwapModalEnabled: true,
  isMoverAPISavingsServiceFieldsReducerEnabled: true,
  isMoverAPISmartTreasuryServiceFieldsReducerEnabled: true,
  isMoverAPISavingsPlusServiceFieldsReducerEnabled: true,
  isGasListenerEnabled: [Network.mainnet],
  isStakingUbtEnabled: [Network.mainnet],
  isStakingUbtFieldReducerEnabled: true,
  hideSlippageSelector: true
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
