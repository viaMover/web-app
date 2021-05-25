<template>
  <div class="overview governance-overview">
    <h4>{{ $t('governance.lblGovernanceStats') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{
          $t('governance.lblPowerToBecomeAProposer')
        }}</span>
        <span class="value">{{ powerToBecomeAProposer }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('governance.lblCommunityVotingPower')
        }}</span>
        <span class="value">{{ communityVotingPower }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblOpenProposals') }}</span>
        <span class="value">{{ openProposals }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblTotalProposals') }}</span>
        <span class="value">{{ totalProposals }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblSucceededProposals') }}</span>
        <span class="value">{{ succeededProposals }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('governance.lblDefeatedProposals') }}</span>
        <span class="value">{{ defeatedProposals }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceStats',
  data() {
    return {
      powerToBecomeAProposer: 0,
      communityVotingPower: 0,
      openProposals: 0,
      totalProposals: 0,
      succeededProposals: 0,
      defeatedProposals: 0
    };
  }
});
</script>
