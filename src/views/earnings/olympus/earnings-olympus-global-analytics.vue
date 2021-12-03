<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <div>
      <secondary-page-simple-title
        class="page-title"
        :description="$t('earnings.txtOverview')"
        :title="$t('earnings.lblOverview', { token: 'Olympus' })"
      />
      <statement-list>
        <statement-list-item
          :description="$t('earnings.lblDepositedAssets')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblCurrentVariableAPY')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lbl30DayAverageAPY')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblTotalAssetsUnderManagement')"
          :value="0"
        />
      </statement-list>
      <statement-list :title="$t('earnings.lblEarningsStats')">
        <statement-list-item
          :description="$t('earnings.lblEarnedToday')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblEarnedThisMonth')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblEarnedInTotal')"
          :value="0"
        />
      </statement-list>
      <statement-list :title="$t('earnings.lblEarningsEstimation')">
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsTomorrow')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsThisMonth')"
          :value="0"
        />
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsAnnually')"
          :value="0"
        />
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'EarningsOlympusGlobalAnalytics',
  components: {
    StatementListItem,
    StatementList,
    SecondaryPageSimpleTitle,
    SecondaryPage
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
