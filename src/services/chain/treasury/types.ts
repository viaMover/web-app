export type TreasuryBalancesReturn = {
  MoveBalance: string;
  LPBalance: string;
};

export type PowercardState = 'Staked' | 'NotStaked' | 'NotStakedCooldown';

export type PowerCardTimings = {
  activeTime: string;
  cooldownTime: string;
};
