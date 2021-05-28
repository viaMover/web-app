import { GetterTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { Proposal, ProposalStoreState } from './types';

export default {
  lastProposal(state): Proposal | null {
    return (
      state.proposals
        .slice()
        .sort((a: Proposal, b: Proposal) => a.ends - b.ends)[0] ?? null
    );
  }
} as GetterTree<ProposalStoreState, RootStoreState>;
