<template>
  <analytics-list v-if="!isError">
    <analytics-list-item
      :description="balanceNative"
      :is-loading="isLoading"
      :title="$t('savings.statement.lblBalance', { month: monthName })"
    />
    <analytics-list-item
      :description="totalEarned"
      :is-loading="isLoading"
      :title="
        $t('savings.statement.lblTotalEarnedInMonth', { month: monthName })
      "
    />
    <analytics-list-item
      :description="averageDailyEarnings"
      :is-loading="isLoading"
      :title="
        $t('savings.statement.lblAverageDailyEarningsInMonth', {
          month: monthName
        })
      "
    />
    <analytics-list-item
      :description="depositsNative"
      :is-loading="isLoading"
      :title="$t('savings.statement.lblDeposits', { month: monthName })"
    />
    <analytics-list-item
      :description="withdrawalsNative"
      :is-loading="isLoading"
      :title="$t('savings.statement.lblWithdrawals', { month: monthName })"
    />
  </analytics-list>
  <div v-else class="error-message">
    {{ $t('savings.lblLoadMonthStatError') }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { SavingsReceipt } from '@/services/mover';
import { SavingsPlusGetReceiptPayload } from '@/store/modules/savings-plus/types';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { SavingsPlusUSDCDecimals } from '@/wallet/references/data';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';

export default Vue.extend({
  name: 'SavingsPlusMonthStatements',
  components: {
    AnalyticsList,
    AnalyticsListItem
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      isError: false,
      receipt: undefined as SavingsReceipt | undefined
    };
  },
  computed: {
    ...mapGetters('savingsPlus', {
      savingsReceipt: 'savingsReceipt',
      usdcNativePrice: 'usdcNativePrice'
    }),
    ...mapState('account', { networkInfo: 'networkInfo' }),
    monthName(): string {
      return this.pageDate.format('MMMM');
    },
    balanceNative(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.endOfMonthBalance === 0
      ) {
        return '$0';
      }

      const balanceInUSDC = fromWei(
        this.receipt.endOfMonthBalance,
        SavingsPlusUSDCDecimals
      );

      const savingsEndOfMonthBalanceNative = multiply(
        balanceInUSDC,
        this.usdcNativePrice
      );
      return `$${formatToNative(savingsEndOfMonthBalanceNative)}`;
    },
    depositsNative(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.totalDeposits === 0
      ) {
        return '0';
      }

      const depositsInUSDC = fromWei(
        this.receipt.totalDeposits,
        SavingsPlusUSDCDecimals
      );

      const savingsMonthTotalDepositsNative = multiply(
        depositsInUSDC,
        this.usdcNativePrice
      );
      const value = formatToNative(savingsMonthTotalDepositsNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    withdrawalsNative(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.totalWithdrawals === 0
      ) {
        return '0';
      }

      const withdrawalsInUSDC = fromWei(
        this.receipt.totalWithdrawals,
        SavingsPlusUSDCDecimals
      );

      const savingsMonthTotalWithdrawalsNative = multiply(
        withdrawalsInUSDC,
        this.usdcNativePrice
      );

      const value = formatToNative(savingsMonthTotalWithdrawalsNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    totalEarned(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.earnedThisMonth === 0
      ) {
        return '0';
      }

      const earnedInUSDC = fromWei(
        this.receipt.earnedThisMonth,
        SavingsPlusUSDCDecimals
      );
      const savingsMonthEarnedNative = multiply(
        earnedInUSDC,
        this.usdcNativePrice
      );

      const value = formatToNative(savingsMonthEarnedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.avgDailyEarnings === 0
      ) {
        return '0';
      }

      const earnedInUSDC = fromWei(
        this.receipt.avgDailyEarnings,
        SavingsPlusUSDCDecimals
      );
      const savingsMonthAverageEarnedNative = multiply(
        earnedInUSDC,
        this.usdcNativePrice
      );

      const value = formatToNative(savingsMonthAverageEarnedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    }
  },
  async mounted() {
    this.isLoading = true;

    const year = this.pageDate.get('year');
    const month = this.pageDate.get('month') + 1;

    this.getReceipt({
      year,
      month
    } as SavingsPlusGetReceiptPayload);

    let receipt: SavingsReceipt | undefined;

    try {
      receipt = await this.savingsReceipt(year, month);
      if (receipt === undefined) {
        throw new Error('receipt is undef');
      }
    } catch (e) {
      this.isLoading = false;
      this.isError = true;
      return;
    }

    this.receipt = receipt;
    this.isLoading = false;
  },
  methods: {
    ...mapActions('savingsPlus', { getReceipt: 'getReceipt' })
  }
});
</script>
