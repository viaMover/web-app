import { ContractMethod, CustomContractType } from '../../types';

export type SmartTreasuryContract = CustomContractType<{
  userInfoMove(address: string): ContractMethod<{
    0: string;
    1: string;
    amount: string;
    rewardTally: string;
  }>;
  userInfoMoveEthLP(address: string): ContractMethod<{
    0: string;
    1: string;
    amount: string;
    rewardTally: string;
  }>;
  totalBonus(_account: string): ContractMethod<string>;
  getDPYPerMoveToken(): ContractMethod<string>;
  maxBurnAmount(): ContractMethod<string>;
  getBurnValue(_account: string, _amount: string): ContractMethod<string>;
  totalStakedMove(): ContractMethod<string>;
  totalStakedMoveEthLP(): ContractMethod<string>;
  withdraw(
    _tokenMoveAmount: string,
    _tokenMoveEthAmount: string
  ): ContractMethod;
  claimUSDCforBonus(): ContractMethod;
}>;

export type TreasuryBalancesReturn = {
  MoveBalance: string;
  LPBalance: string;
};

export enum PowercardState {
  Staked = 'Staked',
  NotStaked = 'NotStaked',
  Cooldown = 'NotStakedCooldown'
}

export type PowerCardTimings = {
  activeTime: string;
  cooldownTime: string;
};

export type PowercardContract = CustomContractType<{
  isApprovedForAll(_owner: string, _operator: string): ContractMethod<boolean>;
  setApprovalForAll(_operator: string, _approved: boolean): ContractMethod;
  balanceOf(_account: string, _id: number): ContractMethod<string>;
}>;

export type PowercardStakerContract = CustomContractType<{
  getPowercardIndex(_owner: string): ContractMethod<string>;
  getRemainingTimings(_staker: string): ContractMethod<{
    active: string;
    cooldown: string;
    0: string;
    1: string;
  }>;
  stakePowercard(): ContractMethod;
  unstakePowercard(): ContractMethod;
}>;
