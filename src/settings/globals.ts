export interface Globals {
  isSwapPassportEnabled: boolean;
  isVaultsEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceEnabled: boolean;
  isBondsEnabled: boolean;
  isCardEnabled: boolean;
  isMoreEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isNftDropsEnabled: boolean;
  isIntercomEnabled: boolean;
  isSavingsMonthlyChartEnabled: boolean;
  isTreasuryMonthlyChartEnabled: boolean;
  isNavigationFallbackEnabled: boolean;
}

const values: Globals = {
  isSwapPassportEnabled: false,
  isVaultsEnabled: true,
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceEnabled: false,
  isBondsEnabled: false,
  isCardEnabled: false,
  isMoreEnabled: true,
  isNibbleShopEnabled: false,
  isNftDropsEnabled: true,
  isIntercomEnabled: false,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isNavigationFallbackEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];
