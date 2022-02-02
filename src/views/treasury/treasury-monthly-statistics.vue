<template>
  <secondary-page
    class="analytics"
    has-back-button
    hide-info
    @back="handleBack"
  >
    <template v-slot:title>
      <secondary-page-header :description="pageSubtitle" :title="pageTitle" />
    </template>

    <treasury-monthly-chart-wrapper
      v-if="isFeatureEnabled('isTreasuryMonthlyChartEnabled')"
    />
    <treasury-monthly-statement :page-date="pageDate" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';
import { SavingsGetReceiptPayload } from '@/store/modules/account/actions/savings';
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
    await this.fetchTreasuryReceipt({
      year: this.pageDate.get('year'),
      month: this.pageDate.get('month') + 1
    } as SavingsGetReceiptPayload);
  },
  methods: {
    ...mapActions('account', { fetchTreasuryReceipt: 'fetchTreasuryReceipt' }),
    isFeatureEnabled,
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
