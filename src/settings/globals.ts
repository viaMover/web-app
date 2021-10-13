export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: boolean;
  isSwapPassportEnabled: boolean;
  isVaultsEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceEnabled: boolean;
  isGovernanceMarkdownEnabled: boolean;
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
  isSavingsOverviewSomeFieldsEnabled: false,
  isSwapPassportEnabled: false,
  isVaultsEnabled: true,
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceEnabled: true,
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isCardEnabled: false,
  isMoreEnabled: true,
  isNibbleShopEnabled: false,
  isNftDropsEnabled: true,
  isIntercomEnabled: true,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isNavigationFallbackEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
};
