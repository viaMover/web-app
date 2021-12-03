export interface Globals {
  isSavingsOverviewSomeFieldsEnabled: boolean;
  isSwapPassportEnabled: boolean;
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceMarkdownEnabled: boolean;
  isBondsEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isIntercomEnabled: boolean;
  isSavingsMonthlyChartEnabled: boolean;
  isTreasuryMonthlyChartEnabled: boolean;
  isEarningsMonthlyChartEnabled: boolean;
  isEarningsEnabled: boolean;
  isEarningsEthereumEnabled: boolean;
  isEarningsOlympusEnabled: boolean;
  isDebitCardTopUpEnabled: boolean;
  isDebitCardChangeSkinEnabled: boolean;
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
  isDebitCardEnabled: true,
  isGovernanceMarkdownEnabled: false,
  isBondsEnabled: false,
  isNibbleShopEnabled: false,
  isIntercomEnabled: !isDevelop(),
  isSavingsMonthlyChartEnabled: false,
  isTreasuryMonthlyChartEnabled: false,
  isEarningsMonthlyChartEnabled: false,
  isEarningsEnabled: true,
  isEarningsEthereumEnabled: true,
  isEarningsOlympusEnabled: true,
  isDebitCardTopUpEnabled: false,
  isDebitCardChangeSkinEnabled: false
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];
