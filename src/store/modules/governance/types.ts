import {
  Choice,
  CurrentVotingInfo,
  MoverAPIGovernanceService,
  ProposalInfo
} from '@/services/v2/api/mover/governance';

export type GovernanceStoreState = {
  isLoadingLastProposalInfo: boolean;
  lastProposalInfoPromise: Promise<ProposalInfo> | undefined;

  isLoadingProposalInfoList: boolean;
  proposalInfoListPromise: Promise<Array<ProposalInfo>> | undefined;

  proposalInfoList: Array<ProposalInfo>;

  currentVotingInfo: CurrentVotingInfo;
  currentVotingInfoPromise: Promise<CurrentVotingInfo> | undefined;

  service: MoverAPIGovernanceService | undefined;
};

export type VoteParams = {
  proposalId: string;
  choice: Choice;
};
