<template>
  <div class="overview treasury-overview">
    <h4>{{ $t('treasuryPage.lblTreasuryStats') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblEarnedToday') }}</span>
        <span class="value">{{ earnedToday }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblEarnedThisMonth') }}</span>
        <span class="value">{{ earnedThisMonth }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblEarnedInTotal') }}</span>
        <span class="value">{{ earnedInTotal }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblSpentToday') }}</span>
        <span class="value">{{ spentToday }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblSpentThisMonth') }}</span>
        <span class="value">{{ spentThisMonth }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasuryPage.lblSpentInTotal') }}</span>
        <span class="value">{{ spentInTotal }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TreasuryStats',
  data() {
    return {
      earnedToday: 0,
      earnedThisMonth: 0,
      earnedInTotal: 0,
      spentToday: 0,
      spentThisMonth: 0,
      spentInTotal: 0
    };
  }
});
</script>
