<template>
  <secondary-page>
    <secondary-page-header :description="pageSubtitle" :title="pageTitle" />
    <review-statement
      :description="balance"
      :title="$t('monthBalance', { month })"
    />

    <review-statement
      :description="totalEarned"
      :title="$t('monthTotalEarned', { month })"
    />

    <review-statement
      :description="averageDailyEarned"
      :title="$t('monthAverageDailyEarned', { month })"
    />

    <review-statement
      :description="deposited"
      :title="$t('monthDeposited', { month })"
    />

    <review-statement
      :description="withdrawn"
      :title="$t('monthWithdrawn', { month })"
    />

    <review-statement
      :description="payoutsToTreasury"
      :title="$t('payoutsToTreasury')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { SavingsReceipt } from '@/services/v2/api/mover/savings';
import { captureSentryException } from '@/services/v2/utils/sentry';
import { SavingsGetReceiptPayload } from '@/store/modules/savings/types';
import { fromWei } from '@/utils/bigmath';
import { dateFromExplicitPair } from '@/utils/time';

import SecondaryPage from '@/components/v1.2/layout/secondary-page.vue';
import SecondaryPageHeader from '@/components/v1.2/layout/secondary-page-header.vue';
import ReviewStatement from '@/components/v1.2/review-statement.vue';

export default Vue.extend({
  components: {
    SecondaryPageHeader,
    SecondaryPage,
    ReviewStatement
  },
  data() {
    return {
      date: dayjs(),
      receipt: undefined as SavingsReceipt | undefined,
      isLoading: false
    };
  },
  computed: {
    ...mapGetters('savings', ['usdcTokenInfo']),
    pageTitle(): string {
      return this.date.format('MMMM YYYY');
    },
    pageSubtitle(): string {
      const left = this.date.format('MMM DD');
      const right = this.date.endOf('month').format('MMM DD, YYYY');

      return `${left} - ${right}`;
    },
    month(): string {
      return this.date.format('MMMM');
    },
    balance(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.endOfMonthBalance, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    },
    totalEarned(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.earnedThisMonth, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    },
    averageDailyEarned(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.avgDailyEarnings, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    },
    deposited(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.totalDeposits, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    },
    withdrawn(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.totalWithdrawals, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    },
    payoutsToTreasury(): string {
      if (this.receipt === undefined) {
        return this.formatAsCryptoWithSymbol(0, this.usdcTokenInfo.symbol);
      }

      return this.formatAsCryptoWithSymbol(
        fromWei(this.receipt.paidToTreasury, this.usdcTokenInfo.decimals),
        this.usdcTokenInfo.symbol
      );
    }
  },
  async mounted() {
    this.$watch(
      () => ({
        year: this.$route.params.year,
        month: this.$route.params.month
      }),
      ({ year, month }) => {
        const date = dateFromExplicitPair(+year, +month);
        this.date = date;
        this.fetchReceipt(date.year(), date.month() + 1);
      },
      { immediate: true }
    );
  },
  methods: {
    ...mapActions('savings', {
      fetchSavingsReceipt: 'fetchSavingsReceipt'
    }),
    async fetchReceipt(year: number, month: number): Promise<void> {
      try {
        this.isLoading = true;
        this.receipt = await this.fetchSavingsReceipt({
          year,
          month
        } as SavingsGetReceiptPayload);
      } catch (error) {
        captureSentryException(error);
        sendGlobalTopMessageEvent(
          this.$t('failedToLoadReceipt') as string,
          'error'
        );
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>
