<template>
  <div class="savings-overview">
    <h4>{{ $t('savingsPage.lblSavingsStats') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('savingsPage.lblSavingsStats') }}</span>
        <span class="value">{{ earnedToday }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savingsPage.lblSavingsEarnedToday') }}</span>
        <span class="value">{{ earnedThisMonth }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savingsPage.lblEarnedThisMonth') }}</span>
        <span class="value">{{ earnedTotal }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SavingsStats',
  data() {
    return {
      earnedToday: 0,
      earnedThisMonth: 0,
      earnedTotal: 0
    };
  }
});
</script>
