<template>
  <secondary-page>
    <treasury-yearly-chart-wrapper />
    <statement-nav-list
      :button-text="$t('treasury.btnView.simple')"
      :icon="$t('treasury.icon')"
      :in-progress-text="$t('treasury.lblInProgress')"
      :items="treasuryMonthStatsOptions"
      navigate-to-name="treasury-month-stats"
      :title="$t('treasury.lblTreasuryStatements')"
      wrapper-class="smart-treasury__menu-wrapper-statements"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { SecondaryPage } from '@/components/layout';
import { StatementNavList } from '@/components/statements/statement-nav-list';
import { TreasuryYearlyChartWrapper } from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManage',
  components: {
    SecondaryPage,
    TreasuryYearlyChartWrapper,
    StatementNavList
  },
  data() {
    return {
      popoverParentId: 'treasury-manage-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', {
      treasuryMonthStatsOptions: 'treasuryMonthStatsOptions'
    })
  }
});
</script>
