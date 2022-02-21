import { isBoolean } from '@/utils/guards';
import { Network } from '@/utils/networkTypes';

type GlobalSettings = Array<Network> | boolean;
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
  isEarningsMonthlyChartEnabled: GlobalSettings;
  isTreasuryEnabled: GlobalSettings;
  isSavingsEnabled: GlobalSettings;
  isExplorerEnabled: GlobalSettings;
  isOffchainExplorerEnabled: GlobalSettings;
  isEarningsEnabled: GlobalSettings;
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
}

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
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
  isEarningsMonthlyChartEnabled: false,
  isTreasuryEnabled: [Network.mainnet],
  isSavingsEnabled: [Network.mainnet],
  isExplorerEnabled: [
    Network.mainnet,
    Network.binance,
    Network.binanceTest,
    Network.kovan,
    Network.ropsten,
    Network.rinkeby,
    Network.avalanche,
    Network.fantom
  ],
  isOffchainExplorerEnabled: [Network.mainnet],
  isEarningsEnabled: false,
  isEarningsEthereumEnabled: false,
  isEarningsOlympusEnabled: false,
  isVaultsRaceEnabled: false,
  isTreasuryClaimAndBurnMOBOEnabled: [Network.mainnet],
  isTreasuryClaimAndBurnMOVEEnabled: false,
  isSavingsPlusEnabled: false,
  isMultiChainMastheadEnabled: true,
  isHomeSwapModalEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(
  key: T,
  network?: Network
): boolean => {
  const setting = values[key];
  if (isBoolean(setting)) {
    return setting;
  }
  if (network === undefined) {
    return true;
  }
  return network ? setting.includes(network) : false;
};
