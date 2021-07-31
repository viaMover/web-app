<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('treasury.lblSmartTreasury')"
    navigate-to-name="treasury-manage"
  >
    <template v-slot:heading>
      {{ $t('treasury.lblTreasuryHeader', { amount: treasuryBonus }) }}
    </template>

    <p>
      {{ $t('treasury.lblTreasuryEarnedToday', { amount: '+$24.89' }) }}
    </p>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'TreasurySection',
  components: {
    HeadingSection
  },
  computed: {
    ...mapGetters('account', { treasuryBonusNative: 'treasuryBonusNative' }),
    treasuryBonus(): string {
      return `$${formatToNative(this.treasuryBonusNative)}`;
    }
  }
});
</script>
