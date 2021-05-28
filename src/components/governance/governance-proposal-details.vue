<template>
  <div v-if="proposal" class="overview governance-overview">
    <h4>{{ $t('governance.lblProposalDetails') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{
          $t('governance.lblAvailableVotingPower')
        }}</span>
        <span class="value">{{ availableVotingPower }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('governance.lblCommunityVotingPower')
        }}</span>
        <span class="value">{{ communityVotingPower }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblVotesFor') }}</span>
        <span class="value">{{ proposal.votesFor }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblVotesAgainst') }}</span>
        <span class="value">{{ proposal.votesAgainst }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblCurrentOutcome') }}</span>
        <span class="value">{{
          $t(`governance.lblOutcome.${proposal.currentOutcome}`)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Proposal } from '@/store/modules/proposal/types';

export default Vue.extend({
  name: 'GovernanceProposalDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      availableVotingPower: 0,
      communityVotingPower: 0
    };
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
  }
});
</script>
