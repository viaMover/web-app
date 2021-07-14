<template>
  <left-rail-section :section-name="$t('treasury.lblTreasuryOverview')">
    <left-rail-section-item
      :description="$t('treasury.lblReservedAssetsValue')"
      :value="reservedAssetsValue"
    />
    <left-rail-section-item
      :description="$t('treasury.lblCurrentBoost')"
      :value="currentBoost"
    />
    <left-rail-section-item
      :description="$t('treasury.lblMaximumBoost')"
      :value="maximumBoost"
    />
    <left-rail-section-item
      :description="$t('treasury.lblSmartTreasurySize')"
      :value="smartTreasurySize"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'TreasuryOverview',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  data() {
    return {
      reservedAssetsValue: '0',
      currentBoost: '0x',
      maximumBoost: '0x',
      smartTreasurySize: '0'
    };
  }
});
</script>
