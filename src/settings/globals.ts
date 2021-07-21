export interface Globals {
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isNftDropsEnabled: boolean;
}

const values: Globals = {
  isReleaseRadarEnabled: true,
  isDebitCardEnabled: true,
  isGovernanceEnabled: true,
  isNibbleShopEnabled: true,
  isNftDropsEnabled: true
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];
