<template>
  <div v-if="proposal" class="overview governance-overview">
    <h4>{{ $t('governance.lblProposalOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('governance.lblProposalId') }}</span>
        <span class="value">{{ id }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblVotingEnds') }}</span>
        <span class="value">{{ formatVotingEnds(proposal.ends) }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblProposer') }}</span>
        <span class="value">{{ proposal.proposer }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblVotingActivity') }}</span>
        <span class="value">{{
          $t('governance.txtVotingActivity', {
            amount: proposal.votingActivity
          })
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import dayjs from 'dayjs';

import { Proposal } from '@/store/modules/proposal/types';

export default Vue.extend({
  name: 'GovernanceProposalOverview',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('proposal', ['proposals']),
    proposal(): Proposal | null {
      return (
        (this.proposals as Array<Proposal>).find(
          (proposal) => proposal.id === this.id
        ) || null
      );
    }
  },
  methods: {
    formatVotingEnds(date: number): string {
      return dayjs.unix(date).utc(false).format('MMMM DD, HH:mm') + ' UTC';
    }
  }
});
</script>
