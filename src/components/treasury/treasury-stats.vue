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
import { mapGetters } from 'vuex';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';
import { formatToNative, getSignIfNeeded } from '@/utils/format';

export default Vue.extend({
  name: 'TreasuryStats',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  computed: {
    ...mapGetters('account', {
      treasuryEarnedThisMonthNative: 'treasuryEarnedThisMonthNative',
      treasuryEarnedTotalNative: 'treasuryEarnedTotalNative'
    }),
    earnedToday(): string {
      const value = '0';
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedThisMonth(): string {
      const value = formatToNative(this.treasuryEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedInTotal(): string {
      const value = formatToNative(this.treasuryEarnedTotalNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    spentToday(): string {
      const value = '0';
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    spentThisMonth(): string {
      const value = '0';
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    spentInTotal(): string {
      const value = '0';
      return `${getSignIfNeeded(value, '-')}$${value}`;
    }
  }
});
</script>
