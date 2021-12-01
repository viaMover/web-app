export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: boolean;
  isSwapPassportEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceMarkdownEnabled: boolean;
  isBondsEnabled: boolean;
  isCardEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isIntercomEnabled: boolean;
  isSavingsMonthlyChartEnabled: boolean;
  isTreasuryMonthlyChartEnabled: boolean;
  isEarningsMonthlyChartEnabled: boolean;
  isEarningsEnabled: boolean;
  isEarningsEthereumEnabled: boolean;
  isEarningsOlympusEnabled: boolean;
}

const values: Globals = {
  isSavingsOverviewSomeFieldsEnabled: false,
  isSwapPassportEnabled: false,
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isCardEnabled: false,
  isNibbleShopEnabled: false,
  isIntercomEnabled: false,
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isEarningsMonthlyChartEnabled: false,
  isEarningsEnabled: true,
  isEarningsEthereumEnabled: true,
  isEarningsOlympusEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelop = (): boolean => {
  return process.env.NODE_ENV === 'development';
};
