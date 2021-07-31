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
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'TreasuryOverview',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  computed: {
    ...mapGetters('account', {
      treasuryStakedBalanceNative: 'treasuryStakedBalanceNative',
      treasuryBoost: 'treasuryBoost',
      treasuryTotalStakedBalanceNative: 'treasuryTotalStakedBalanceNative'
    }),
    reservedAssetsValue(): string {
      return `$${formatToNative(this.treasuryStakedBalanceNative)}`;
    },
    currentBoost(): string {
      return `${this.treasuryBoost}x`;
    },
    maximumBoost(): string {
      // TODO: compute if needed
      return '2.5x';
    },
    smartTreasurySize(): string {
      return `$${formatToNative(this.treasuryTotalStakedBalanceNative)}`;
    }
  }
});
</script>
