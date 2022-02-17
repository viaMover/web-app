<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        class="monthly-statements-title"
        :description="pageSubtitle"
        :title="pageTitle"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="balanceNative"
        :title="$t('earnings.statement.lblBalance', { month: monthName })"
      />
      <analytics-list-item
        :description="totalEarned"
        :title="
          $t('earnings.statement.lblTotalEarnedInMonth', { month: monthName })
        "
      />
      <analytics-list-item
        :description="
          $t('earnings.statement.lblAverageDailyEarningsInMonth', {
            month: monthName
          })
        "
        :value="averageDailyEarnings"
      />
      <analytics-list-item
        :description="depositsNative"
        :title="$t('earnings.statement.lblDeposits', { month: monthName })"
      />
      <analytics-list-item
        :description="withdrawalsNative"
        :title="$t('earnings.statement.lblWithdrawals', { month: monthName })"
      />
      <analytics-list-item
        :description="savedFeesNative"
        :title="$t('earnings.statement.lblSavedFees')"
      />
      <analytics-list-item
        :description="payoutsToTreasuryNative"
        :title="$t('earnings.statement.lblPayoutsToEarnings')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';
import { FetchOlympusReceiptPayload } from '@/store/modules/earnings/modules/olympus/types';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'EarningsOlympusMonthlyStatistics',
  components: {
    AnalyticsListItem,
    AnalyticsList,
    SecondaryPageHeader,
    SecondaryPage
  },
  computed: {
    pageDate(): dayjs.Dayjs {
      try {
        return dateFromExplicitPair(
          Number(this.$route.params.year),
          Number(this.$route.params.month)
        );
      } catch {
        return dayjs().startOf('month');
      }
    },
    pageTitle(): string {
      return this.pageDate.format('MMMM YYYY');
    },
    pageSubtitle(): string {
      const left = this.pageDate.format('MMM DD');
      const right = this.pageDate.endOf('month').format('MMM DD, YYYY');

      return `${left} - ${right}`;
    },
    monthName(): string {
      return this.pageDate.format('MMMM');
    },
    balanceNative(): string {
      return `$${formatToNative(0)}`;
    },
    depositsNative(): string {
      const value = formatToNative(0);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    withdrawalsNative(): string {
      const value = formatToNative(0);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    savedFeesNative(): string {
      return `$${formatToNative(0)}`;
    },
    payoutsToTreasuryNative(): string {
      return `$${formatToNative(0)}`;
    },
    totalEarned(): string {
      const value = formatToNative(0);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      const value = formatToNative(0);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    }
  },
  async mounted() {
    await this.fetchMonthlyStats({
      year: this.pageDate.get('year'),
      month: this.pageDate.get('month') + 1
    } as FetchOlympusReceiptPayload);
  },
  methods: {
    isFeatureEnabled,
    ...mapActions('earnings/olympus', {
      fetchMonthlyStats: 'fetchOlympusReceipt'
    }),
    handleBack(): void {
      this.$router.back();
    }
  },
  async beforeRouteUpdate(to, from, next) {
    if (
      from.params.year === to.params.year &&
      from.params.month === to.params.month
    ) {
      next();
      return;
    }

    let date: dayjs.Dayjs;
    try {
      date = dateFromExplicitPair(
        Number(this.$route.params.year),
        Number(this.$route.params.month)
      );
    } catch {
      date = dayjs();
    }

    await this.fetchMonthlyStats({
      year: date.get('year'),
      month: date.get('month') + 1
    } as FetchOlympusReceiptPayload);
  }
});
</script>
