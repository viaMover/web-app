export interface Globals {
  isReleaseRadarEnabled: boolean;
  isDebitCardEnabled: boolean;
  isGovernanceEnabled: boolean;
  isNibbleShopEnabled: boolean;
  isNftDropsEnabled: boolean;
}

const values: Globals = {
  isReleaseRadarEnabled: false,
  isDebitCardEnabled: false,
  isGovernanceEnabled: false,
  isNibbleShopEnabled: false,
  isNftDropsEnabled: false
};

export const isFeatureEnabled = <T extends keyof Globals>(key: T): boolean =>
  !!values[key];
