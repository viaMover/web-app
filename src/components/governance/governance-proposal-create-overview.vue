<template>
  <div class="overview governance-overview">
    <h4>{{ $t('governance.lblProposalOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('governance.lblVotingPeriod') }}</span>
        <span class="value">{{
          $t('governance.txtVotingPeriod', { days: votingPeriod })
        }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('governance.lblMinimumVotingThreshold')
        }}</span>
        <span class="value">{{ minimumVotingThreshold }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblProposer') }}</span>
        <span class="value">{{ proposer }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceProposalCreateOverview',
  data() {
    return {
      votingPeriod: 3,
      minimumVotingThreshold: 0,
      proposer: 0
    };
  }
});
</script>
