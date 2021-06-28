<template>
  <secondary-page :title="$t('savings.lblSavings')">
    <h2>{{ pageTitle }}</h2>
    <savings-monthly-chart :page-date="pageDate" />
    <savings-monthly-statement :page-date="pageDate" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import dayjs from 'dayjs';

import { SecondaryPage } from '@/components/layout';
import { GetSavingsReceiptPayload } from '@/store/modules/account/actions/charts';

import {
  SavingsMonthlyChart,
  SavingsMonthlyStatement
} from '@/components/savings';
export default Vue.extend({
  name: 'SavingsMonthlyStatistics',
  components: {
    SecondaryPage,
    SavingsMonthlyChart,
    SavingsMonthlyStatement
  },
  computed: {
    pageDate(): dayjs.Dayjs {
      try {
        return dayjs(
          new Date(
            Number(this.$route.params.year),
            Number(this.$route.params.month),
            0
          )
        );
      } catch {
        return dayjs().startOf('month');
      }
    },
    pageTitle(): string {
      return this.pageDate.format('MMMM YYYY');
    }
  },
  async mounted() {
    await this.fetchMonthlyStats({
      year: this.pageDate.get('year'),
      month: this.pageDate.get('month')
    } as GetSavingsReceiptPayload);
  },
  methods: {
    ...mapActions('account', { fetchMonthlyStats: 'fetchSavingsReceipt' })
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
      date = dayjs(
        new Date(
          Number(this.$route.params.year),
          Number(this.$route.params.month),
          0
        )
      );
    } catch {
      date = dayjs();
    }

    this.fetchMonthlyStats({
      year: date.get('year'),
      month: date.get('month')
    } as GetSavingsReceiptPayload);
  }
});
</script>
