<template>
  <analytics-list v-if="!isError">
    <analytics-list-item
      :description="balanceNative"
      :is-loading="isLoading"
      :title="$t('stakingUBT.statement.lblBalance', { month: monthName })"
    />
    <analytics-list-item
      :description="totalEarned"
      :is-loading="isLoading"
      :title="
        $t('stakingUBT.statement.lblTotalEarnedInMonth', { month: monthName })
      "
    />
    <analytics-list-item
      :description="averageDailyEarnings"
      :is-loading="isLoading"
      :title="
        $t('stakingUBT.statement.lblAverageDailyEarningsInMonth', {
          month: monthName
        })
      "
    />
    <analytics-list-item
      :description="depositsNative"
      :is-loading="isLoading"
      :title="$t('stakingUBT.statement.lblDeposits', { month: monthName })"
    />
    <analytics-list-item
      :description="withdrawalsNative"
      :is-loading="isLoading"
      :title="$t('stakingUBT.statement.lblWithdrawals', { month: monthName })"
    />
    <analytics-list-item
      :description="savedFeesNative"
      :is-loading="isLoading"
      :title="$t('stakingUBT.statement.lblSavedFees')"
    />
    <analytics-list-item
      :description="payoutsToTreasuryNative"
      :is-loading="isLoading"
      :title="$t('stakingUBT.statement.lblPayoutsToTreasury')"
    />
  </analytics-list>
  <div v-else class="error-message">
    {{ $t('stakingUBT.lblLoadMonthStatError') }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { StakingUbtReceipt } from '@/services/v2/api/mover/staking-ubt';
import { StakingUbtGetReceiptPayload } from '@/store/modules/staking-ubt/types';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { getUSDCAssetData } from '@/wallet/references/data';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';

export default Vue.extend({
  name: 'StakingUbtMonthStatements',
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
      receipt: undefined as StakingUbtReceipt | undefined
    };
  },
  computed: {
    ...mapGetters('stakingUBT', {
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
        getUSDCAssetData(this.networkInfo.network).decimals
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
        getUSDCAssetData(this.networkInfo.network).decimals
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
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const savingsMonthTotalWithdrawalsNative = multiply(
        withdrawalsInUSDC,
        this.usdcNativePrice
      );

      const value = formatToNative(savingsMonthTotalWithdrawalsNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    savedFeesNative(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.savedFees === 0
      ) {
        return '$0';
      }

      const savingsMonthSavedFees = fromWei(
        this.receipt.savedFees,
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const savingsMonthSavedFeesNative = multiply(
        savingsMonthSavedFees,
        this.usdcNativePrice
      );
      return `$${formatToNative(savingsMonthSavedFeesNative)}`;
    },
    payoutsToTreasuryNative(): string {
      if (
        this.receipt === undefined ||
        this.isLoading ||
        this.isError ||
        this.networkInfo === undefined ||
        this.receipt.paidToTreasury === 0
      ) {
        return '$0';
      }

      const savingsMonthPaidToTreasury = fromWei(
        this.receipt.paidToTreasury,
        getUSDCAssetData(this.networkInfo.network).decimals
      );
      const savingsMonthPaidToTreasuryNative = multiply(
        savingsMonthPaidToTreasury,
        this.usdcNativePrice
      );
      return `$${formatToNative(savingsMonthPaidToTreasuryNative)}`;
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
        getUSDCAssetData(this.networkInfo.network).decimals
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
        getUSDCAssetData(this.networkInfo.network).decimals
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
    } as StakingUbtGetReceiptPayload);

    let receipt: StakingUbtReceipt | undefined;

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
    ...mapActions('stakingUBT', { getReceipt: 'getReceipt' })
  }
});
</script>
