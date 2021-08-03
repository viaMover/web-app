<template>
  <secondary-page>
    <template v-slot:title>
      <div class="smart-treasury-statements__wrapper-title">
        <h2>{{ pageTitle }}</h2>
        <p>{{ pageSubtitle }}</p>
      </div>
    </template>
    <treasury-monthly-chart-wrapper
      v-if="isFeatureEnabled('isTreasuryMonthlyChartEnabled')"
    />
    <treasury-monthly-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';
import { mapActions } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { dateFromExplicitPair } from '@/utils/time';
import { SavingsGetReceiptPayload } from '@/store/modules/account/actions/savings';

import { SecondaryPage } from '@/components/layout';
import {
  TreasuryMonthlyChartWrapper,
  TreasuryMonthlyStatement
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryMonthlyStatistics',
  components: {
    SecondaryPage,
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
      const right = this.pageDate.format('MMM DD, YYYY');

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
    isFeatureEnabled
  }
});
</script>
