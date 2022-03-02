<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header :description="pageSubtitle" :title="pageTitle" />
    </template>

    <treasury-monthly-chart-wrapper v-if="isTreasuryMonthlyChartEnabled" />
    <treasury-monthly-statement :page-date="pageDate" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';
import { dateFromExplicitPair } from '@/utils/time';

import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import {
  TreasuryMonthlyChartWrapper,
  TreasuryMonthlyStatement
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryMonthlyStatistics',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    TreasuryMonthlyChartWrapper,
    TreasuryMonthlyStatement
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
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
  methods: {
    isTreasuryMonthlyChartEnabled(): boolean {
      return isFeatureEnabled(
        'isTreasuryMonthlyChartEnabled',
        this.networkInfo?.network
      );
    },
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
