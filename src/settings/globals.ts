export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: boolean;
  isSwapPassportEnabled: boolean;
  isVaultsEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isGovernanceEnabled: boolean;
  isGovernanceMarkdownEnabled: boolean;
  isBondsEnabled: boolean;
  isMoreEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isNftDropsEnabled: boolean;
  isIntercomEnabled: boolean;
  isSavingsMonthlyChartEnabled: boolean;
  isTreasuryMonthlyChartEnabled: boolean;
  isNavigationFallbackEnabled: boolean;
  isDebitCardTopUpEnabled: boolean;
  isDebitCardChangeSkinEnabled: boolean;
}

const values: Globals = {
  isSavingsOverviewSomeFieldsEnabled: false,
  isSwapPassportEnabled: false,
  isVaultsEnabled: true,
  isReleaseRadarEnabled: false,
  isGovernanceEnabled: true,
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isMoreEnabled: true,
  isNibbleShopEnabled: false,
  isNftDropsEnabled: true,
  isIntercomEnabled: false,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isNavigationFallbackEnabled: true,
  isDebitCardTopUpEnabled: false,
  isDebitCardChangeSkinEnabled: false
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
};
