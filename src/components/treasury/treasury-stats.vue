<template>
  <left-rail-section :section-name="$t('treasury.lblTreasuryStats')">
    <left-rail-section-item
      :description="$t('treasury.lblEarnedToday')"
      :value="earnedToday"
    />
    <left-rail-section-item
      :description="$t('treasury.lblEarnedThisMonth')"
      :value="earnedThisMonth"
    />
    <left-rail-section-item
      :description="$t('treasury.lblEarnedInTotal')"
      :value="earnedInTotal"
    />
    <left-rail-section-item
      :description="$t('treasury.lblSpentToday')"
      :value="spentToday"
    />
    <left-rail-section-item
      :description="$t('treasury.lblSpentThisMonth')"
      :value="spentThisMonth"
    />
    <left-rail-section-item
      :description="$t('treasury.lblSpentInTotal')"
      :value="spentInTotal"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'TreasuryStats',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  data() {
    return {
      earnedToday: '0',
      earnedThisMonth: '0',
      earnedInTotal: '0',
      spentToday: '0',
      spentThisMonth: '0',
      spentInTotal: '0'
    };
  }
});
</script>
