export type GamesStoreState = {
  isLoading: boolean;

  vaultsRaceAccounts: Array<VaultRaceAccount>;
};

export type VaultRaceAccount = {
  address: string;
  points: number;
  allowRoll: boolean;
  position: number;
  score: number;
};
