<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <secondary-page-simple-title
      class="monthly-statements-title"
      :description="pageSubtitle"
      :title="pageTitle"
    />
    <statement-list>
      <statement-list-item
        :description="$t('earnings.statement.lblBalance', { month: monthName })"
        :value="balanceNative"
      />
      <statement-list-item
        :description="
          $t('earnings.statement.lblTotalEarnedInMonth', { month: monthName })
        "
        :value="totalEarned"
      />
      <statement-list-item
        :description="
          $t('earnings.statement.lblAverageDailyEarningsInMonth', {
            month: monthName
          })
        "
        :value="averageDailyEarnings"
      />
      <statement-list-item
        :description="
          $t('earnings.statement.lblDeposits', { month: monthName })
        "
        :value="depositsNative"
      />
      <statement-list-item
        :description="
          $t('earnings.statement.lblWithdrawals', { month: monthName })
        "
        :value="withdrawalsNative"
      />
      <statement-list-item
        :description="$t('earnings.statement.lblSavedFees')"
        :value="savedFeesNative"
      />
      <statement-list-item
        :description="$t('earnings.statement.lblPayoutsToEarnings')"
        :value="payoutsToTreasuryNative"
      />
    </statement-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';
import { FetchEthereumReceiptPayload } from '@/store/modules/earnings/modules/ethereum/types';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';

import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'EarningsEthereumMonthlyStatistics',
  components: {
    StatementListItem,
    StatementList,
    SecondaryPageSimpleTitle,
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
    } as FetchEthereumReceiptPayload);
  },
  methods: {
    isFeatureEnabled,
    ...mapActions('earnings/ethereum', {
      fetchMonthlyStats: 'fetchEthereumReceipt'
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
    } as FetchEthereumReceiptPayload);
  }
});
</script>
