<template>
  <div class="overview treasury-overview">
    <h4>{{ $t('treasury.lblTreasuryOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('treasury.lblReservedAssetsValue') }}</span>
        <span class="value">{{ reservedAssetsValue }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasury.lblCurrentBoost') }}</span>
        <span class="value">{{ currentBoost }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasury.lblMaximumBoost') }}</span>
        <span class="value">{{ maximumBoost }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('treasury.lblSmartTreasurySize') }}</span>
        <span class="value">{{ smartTreasurySize }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TreasuryOverview',
  data() {
    return {
      reservedAssetsValue: 0,
      currentBoost: 0,
      maximumBoost: 0,
      smartTreasurySize: 0
    };
  }
});
</script>
