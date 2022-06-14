<template>
  <secondary-page class="analytics">
    <template v-slot:title>
      <secondary-page-header :title="$t('savingsMonthlyStatistics')" />
    </template>

    <div class="chart-wrapper">
      <bar-chart
        accent-color="#FF930F"
        :chart-data-source="chartDataSource"
        default-color="rgb(216, 216, 216)"
        :is-loading="isLoading || savingsInfo === undefined"
      />
    </div>

    <table class="analytics-table">
      <tbody>
        <tr>
          <td>
            <div class="analytics-item">
              <div class="title emphasize">
                <span class="emoji">💰</span>
                {{ $t('balance') }}
              </div>
              <div class="description">{{ balance }}</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title emphasize">{{ $t('earnedThisMonth') }}</div>
              <div class="description">{{ earnedThisMonth }}</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title emphasize">{{ $t('balanceChange') }}</div>
              <div class="description">{{ balanceChange }}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="analytics-item">
              <div class="title emphasize">
                <span class="emoji">🤖</span>
                {{ $t('currentAPY') }}
              </div>
              <div class="description">{{ apy }}%</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title">{{ $t('earnedToday') }}</div>
              <div class="description">{{ earnedToday }}</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title">{{ $t('deposited') }}</div>
              <div class="description">{{ deposited }}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="analytics-item">
              <div class="title emphasize">
                <span class="emoji">📜</span>
                {{ $t('30dayAPY') }}
              </div>
              <div class="description">{{ apy30Days }}%</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title">{{ $t('earnedTotal') }}</div>
              <div class="description">{{ earnedTotal }}</div>
            </div>
          </td>
          <td>
            <div class="analytics-item">
              <div class="title">{{ $t('withdrawn') }}</div>
              <div class="description">{{ withdrawn }}</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <statements-nav-list
      :button-text="$t('view')"
      icon="👛"
      :in-progress-text="$t('inProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="savings-month-stats"
      :title="$t('monthlyStatements')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { SavingsReceipt } from '@/services/v2/api/mover/savings';
import { captureSentryException } from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
import { SavingsGetReceiptPayload } from '@/store/modules/savings/types';
import { add, fromWei, multiply } from '@/utils/bigmath';
import { formatPercents } from '@/utils/format';

import BarChart from '@/components/charts/bar-chart.vue';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';
import StatementsNavList from '@/components/statements-nav-list/statements-nav-list.vue';

export default Vue.extend({
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    BarChart,
    StatementsNavList
  },
  data() {
    return {
      receipt: undefined as SavingsReceipt | undefined
    };
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    ...mapState('savings', {
      isLoading: 'isSavingsInfoLoading',
      savingsAPY: 'savingsAPY'
    }),
    ...mapGetters('savings', {
      usdcTokenInfo: 'usdcTokenInfo',
      savingsInfo: 'savingsInfo',
      savingsMonthStatsOptions: 'savingsMonthStatsOptions',
      savingsInfoEarnedThisMonthNative: 'savingsInfoEarnedThisMonthNative',
      savingsInfoEarnedTotalNative: 'savingsInfoEarnedTotalNative',
      savingsEstimatedEarningsTomorrowNative:
        'savingsEstimatedEarningsTomorrowNative',
      savingsAvg30DaysAPY: 'savingsAvg30DaysAPY',
      savingsInfoBalanceNative: 'savingsInfoBalanceNative'
    }),
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      return this.savingsInfo !== undefined
        ? this.savingsInfo.last12MonthsBalances
        : [];
    },
    earnedToday(): string {
      // fixme: controversial thing. Would be better to replace an estimate with the real value
      return this.formatAsNativeCurrency(
        this.savingsEstimatedEarningsTomorrowNative
      );
    },
    earnedThisMonth(): string {
      if (this.receipt !== undefined) {
        return this.formatAsNativeCurrency(
          multiply(
            fromWei(this.receipt.earnedThisMonth, this.usdcTokenInfo.decimals),
            this.usdcTokenInfo.priceUSD
          )
        );
      }

      return this.formatAsNativeCurrency(this.savingsInfoEarnedThisMonthNative);
    },
    earnedTotal(): string {
      return this.formatAsNativeCurrency(this.savingsInfoEarnedTotalNative);
    },
    balance(): string {
      return this.formatAsNativeCurrency(this.savingsInfoBalanceNative);
    },
    apy(): string {
      return formatPercents(this.savingsAPY);
    },
    apy30Days(): string {
      return formatPercents(this.savingsAvg30DaysAPY);
    },
    balanceChange(): string {
      if (this.receipt === undefined) {
        return this.formatAsNativeCurrency(0);
      }

      const usdcAmount = fromWei(
        add(
          add(this.receipt.totalDeposits, this.receipt.totalWithdrawals),
          this.receipt.earnedThisMonth
        ),
        this.usdcTokenInfo.decimals
      );
      const nativeAmount = multiply(usdcAmount, this.usdcTokenInfo.priceUSD);
      return this.formatAsNativeCurrency(nativeAmount);
    },
    deposited(): string {
      if (this.receipt === undefined) {
        return this.formatAsNativeCurrency(0);
      }

      const usdcAmount = fromWei(
        this.receipt.totalDeposits,
        this.usdcTokenInfo.decimals
      );
      const nativeAmount = multiply(usdcAmount, this.usdcTokenInfo.priceUSD);
      return this.formatAsNativeCurrency(nativeAmount);
    },
    withdrawn(): string {
      if (this.receipt === undefined) {
        return this.formatAsNativeCurrency(0);
      }

      const usdcAmount = fromWei(
        this.receipt.totalWithdrawals,
        this.usdcTokenInfo.decimals
      );
      const nativeAmount = multiply(usdcAmount, this.usdcTokenInfo.priceUSD);
      return this.formatAsNativeCurrency(nativeAmount);
    }
  },
  async created() {
    this.loadInfo();
    const now = dayjs();
    this.fetchSavingsReceipt({
      year: now.year(),
      month: now.month() + 1
    } as SavingsGetReceiptPayload)
      .then((receipt) => {
        this.receipt = receipt;
      })
      .catch((error) => {
        captureSentryException(error);
      });
  },
  methods: {
    ...mapActions('savings', ['loadInfo', 'fetchSavingsReceipt']),
    isFeatureEnabled
  }
});
</script>
