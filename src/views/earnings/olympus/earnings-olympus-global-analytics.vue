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
          :value="depositAsset"
        />
        <statement-list-item
          :description="$t('earnings.lblCurrentVariableAPY')"
          :value="currentVariableAPY"
        />
        <statement-list-item
          :description="$t('earnings.lbl30DayAverageAPY')"
          :value="monthAverageAPY"
        />
        <statement-list-item
          :description="$t('earnings.lblTotalAssetsUnderManagement')"
          :value="totalAssetsUnderManagement"
        />
      </statement-list>
      <statement-list :title="$t('earnings.lblEarningsStats')">
        <statement-list-item
          :description="$t('earnings.lblEarnedToday')"
          :value="earnedToday"
        />
        <statement-list-item
          :description="$t('earnings.lblEarnedThisMonth')"
          :value="earnedThisMonth"
        />
        <statement-list-item
          :description="$t('earnings.lblEarnedInTotal')"
          :value="earnedInTotal"
        />
      </statement-list>
      <statement-list :title="$t('earnings.lblEarningsEstimation')">
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsTomorrow')"
          :value="estimatedEarningsTomorrow"
        />
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsThisMonth')"
          :value="estimatedEarningsThisMonth"
        />
        <statement-list-item
          :description="$t('earnings.lblEstimatedEarningsAnnually')"
          :value="estimatedEarningsAnnually"
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
  computed: {
    depositAsset(): number {
      return 0;
    },
    currentVariableAPY(): number {
      return 0;
    },
    monthAverageAPY(): number {
      return 0;
    },
    totalAssetsUnderManagement(): number {
      return 0;
    },
    earnedToday(): number {
      return 0;
    },
    earnedThisMonth(): number {
      return 0;
    },
    earnedInTotal(): number {
      return 0;
    },
    estimatedEarningsTomorrow(): number {
      return 0;
    },
    estimatedEarningsThisMonth(): number {
      return 0;
    },
    estimatedEarningsAnnually(): number {
      return 0;
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
