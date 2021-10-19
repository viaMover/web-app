export type TreasuryBalancesReturn = {
  MoveBalance: string;
  LPBalance: string;
};

export type PowercardState = 'Staked' | 'NotStaked' | 'NotStakedCooldown';

export type PowerCarTimings = {
  activeTime: string;
  cooldownTime: string;
};
