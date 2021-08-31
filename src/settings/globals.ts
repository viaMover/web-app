export interface Globals {
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
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceEnabled: false,
  isBondsEnabled: false,
  isCardEnabled: false,
  isMoreEnabled: false,
  isNibbleShopEnabled: false,
  isNftDropsEnabled: true,
  isIntercomEnabled: false,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isNavigationFallbackEnabled: false
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];
