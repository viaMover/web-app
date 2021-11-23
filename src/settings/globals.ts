export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: boolean;
  isSwapPassportEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceMarkdownEnabled: boolean;
  isBondsEnabled: boolean;
  isCardEnabled: boolean;
  isMoreEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isIntercomEnabled: boolean;
  isSavingsMonthlyChartEnabled: boolean;
  isTreasuryMonthlyChartEnabled: boolean;
}

const values: Globals = {
  isSavingsOverviewSomeFieldsEnabled: false,
  isSwapPassportEnabled: false,
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isCardEnabled: false,
  isMoreEnabled: true,
  isNibbleShopEnabled: false,
  isIntercomEnabled: false,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
};
