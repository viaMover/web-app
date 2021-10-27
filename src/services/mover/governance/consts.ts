export const voteHubBaseUrl = 'https://vote.viamover.com';
export const scoresApiBaseUrl = 'https://vote.viamover.com/api';
export const graphqlUrl = voteHubBaseUrl + '/graphql';
export const defaultClientVersion = '0.1.3';
export const moverSpaceId = 'mover';
export const defaultCachePeriodSeconds = 60;
const defaultMinimumVotingThresholdMultiplier = 0.4;
export const defaultProposalDurationDays = 3;
const defaultPowerNeededToBecomeAProposer = 100000;

const minimumVotingThresholdHistory: { [timestamp: number]: number } = {
  1634621634: 0.2
};
export const getDefaultMinimumVotingThresholdMultiplier = (
  timestamp: number
): number => {
  const boundaries = Object.keys(minimumVotingThresholdHistory)
    .slice()
    .sort()
    .map((key) => Number.parseInt(key));
  if (boundaries.length < 1 || timestamp < boundaries[0]) {
    return defaultMinimumVotingThresholdMultiplier;
  }

  for (let i = 1; i < boundaries.length; i += 1) {
    if (timestamp < boundaries[i]) {
      return minimumVotingThresholdHistory[boundaries[i - 1]];
    }
  }

  return minimumVotingThresholdHistory[boundaries[boundaries.length - 1]];
};

const powerNeededToBecomeAProposerHistory: { [timestamp: number]: number } = {};
export const getDefaultPowerNeededToBecomeAProposer = (
  timestamp: number
): number => {
  const boundaries = Object.keys(powerNeededToBecomeAProposerHistory)
    .slice()
    .sort()
    .map((key) => Number.parseInt(key));
  if (boundaries.length < 1 || timestamp < boundaries[0]) {
    return defaultPowerNeededToBecomeAProposer;
  }

  for (let i = 1; i < boundaries.length; i += 1) {
    if (timestamp < boundaries[i]) {
      return powerNeededToBecomeAProposerHistory[boundaries[i - 1]];
    }
  }

  return powerNeededToBecomeAProposerHistory[boundaries[boundaries.length - 1]];
};
