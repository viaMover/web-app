<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <secondary-page-simple-title
      class="monthly-statements-title"
      :description="pageSubtitle"
      :title="pageTitle"
    />
    <savings-monthly-chart-wrapper
      v-if="isFeatureEnabled('isSavingsMonthlyChartEnabled')"
      :page-date="pageDate"
    />
    <savings-monthly-statement :page-date="pageDate" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';
import { SavingsGetReceiptPayload } from '@/store/modules/account/actions/savings';
import { dateFromExplicitPair } from '@/utils/time';

import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import {
  SavingsMonthlyChartWrapper,
  SavingsMonthlyStatement
} from '@/components/savings';
export default Vue.extend({
  name: 'SavingsMonthlyStatistics',
  components: {
    SecondaryPageSimpleTitle,
    SecondaryPage,
    SavingsMonthlyChartWrapper,
    SavingsMonthlyStatement
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
    }
  },
  async mounted() {
    await this.fetchMonthlyStats({
      year: this.pageDate.get('year'),
      month: this.pageDate.get('month') + 1
    } as SavingsGetReceiptPayload);
  },
  methods: {
    ...mapActions('account', { fetchMonthlyStats: 'fetchSavingsReceipt' }),
    isFeatureEnabled,
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
    } as SavingsGetReceiptPayload);
  }
});
</script>
