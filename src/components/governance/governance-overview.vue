<template>
  <div class="overview governance-overview">
    <h4>{{ $t('governance.lblGovernanceOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('governance.lblVotingPower') }}</span>
        <span class="value">{{ votingPower }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblTimesVoted') }}</span>
        <span class="value">{{ timesVoted }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblProposalsCreated') }}</span>
        <span class="value">{{ proposalsCreated }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceOverview',
  data() {
    return {
      votingPower: 0,
      timesVoted: 0,
      proposalsCreated: 0
    };
  }
});
</script>
