import gql from 'graphql-tag';

export const PROPOSALS_QUERY = gql`
  query ProposalIds($space: String!) {
    proposals(where: { space: $space }) {
      id
    }
  }
`;

export const LAST_PROPOSAL_QUERY = gql`
  query LastProposal {
    proposals(first: 1, orderBy: "end", orderDirection: desc) {
      id
    }
  }
`;

export const PROPOSAL_VOTES_QUERY = gql`
  query ($id: String!) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      network
      created
      type
      strategies {
        name
        params
      }
    }
    votes(where: { proposal: $id }) {
      id
      ipfs
      voter
      created
      choice
    }
  }
`;
