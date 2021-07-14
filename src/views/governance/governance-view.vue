<template>
  <content-wrapper
    :has-back-button="hasBackButton"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-proposal-overview :id="proposal.id" />
      <governance-proposal-details :id="proposal.id" />
    </template>

    <secondary-page
      :has-heading-buttons="isEnoughVotingPower"
      :title="$t('governance.lblProposal')"
    >
      <template v-if="isEnoughVotingPower" v-slot:heading-buttons>
        <action-button @button-click="vote(true)">
          {{ $t('governance.btnVoteFor.emoji') }}
        </action-button>
        <action-button @button-click="vote(false)">
          {{ $t('governance.btnVoteAgainst.emoji') }}
        </action-button>
      </template>

      <h2>{{ proposal.name }}</h2>
      <governance-proposal :id="proposal.id" />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage, ContentWrapper } from '@/components/layout';
import { ActionButton } from '@/components/buttons';
import {
  GovernanceProposalOverview,
  GovernanceProposalDetails,
  GovernanceProposal
} from '@/components/governance';

export default Vue.extend({
  name: 'GovernanceView',
  components: {
    ContentWrapper,
    SecondaryPage,
    ActionButton,
    GovernanceProposalOverview,
    GovernanceProposalDetails,
    GovernanceProposal
  },
  data() {
    return {
      // todo: should be in the store some day
      proposal: {
        id: 'CIP10-1',
        name: 'Governance Analysis Period',
        status: 'open',
        text:
          'Summary:\n\n' +
          'This post outlines a framework for funding Uniswap ecosystem development ' +
          'with grants from the UNI Community Treasury. The program starts small—sponsoring ' +
          'hackathons, for example—but could grow in significance over time ' +
          '(with renewals approved by governance) to fund core protocol development. ' +
          'Grants administration is a subjective process that cannot be easily automated, ' +
          'and thus we propose a nimble committee of 6 members —1 lead and 5 reviewers—to ' +
          'deliver an efficient, predictable process to applicants, such that funding can be ' +
          'administered without having to put each application to a vote. We propose the program ' +
          'start with an initial cap of $750K per quarter and a limit of 2 quarters before renewal—a ' +
          'sum that we feel is appropriate for an MVP relative to the size of the treasury that UNI ' +
          'token holders are entrusted with allocating.\n\n' +
          'Purpose:\n\n' +
          'The mission of the UGP is to provide valuable resources to help grow the Uniswap ecosystem. ' +
          'Through public discourse and inbound applications, the community will get first-hand exposure to ' +
          'identify and respond to the most pressing needs of the ecosystem, as well as the ability to support ' +
          'innovative projects expanding the capabilities of Uniswap. By rewarding talent early with developer ' +
          'incentives, bounties, and infrastructure support, UGP acts as a catalyst for growth and helps to maintain ' +
          'Uniswap as a nexus for DeFi on Ethereum.',
        proposer:
          '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        ends: 1621609904,
        votingActivity: 27,
        votesFor: 8194000,
        votesAgainst: 46000,
        currentOutcome: 'quorumNotReached'
      }
    };
  },
  computed: {
    hasBackButton(): boolean {
      return this.$route.path.split('/').filter((part) => !!part).length > 1;
    },
    isEnoughVotingPower(): boolean {
      return true;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    vote(decision: boolean): void {
      //
    }
  }
});
</script>
