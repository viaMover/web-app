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
import { getUBTAssetData, getUSDCAssetData } from '@/wallet/references/data';

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
      ubtReceipt: 'receipt',
      ubtNativePrice: 'ubtNativePrice'
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

      const endOfMonthBalanceNative = multiply(
        balanceInUSDC,
        this.ubtNativePrice
      );
      return `$${formatToNative(endOfMonthBalanceNative)}`;
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

      const depositsInUBT = fromWei(
        this.receipt.totalDeposits,
        getUBTAssetData(this.networkInfo.network).decimals
      );

      const monthTotalDepositsNative = multiply(
        depositsInUBT,
        this.ubtNativePrice
      );
      const value = formatToNative(monthTotalDepositsNative);
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

      const withdrawalsInUBT = fromWei(
        this.receipt.totalWithdrawals,
        getUBTAssetData(this.networkInfo.network).decimals
      );

      const monthTotalWithdrawalsNative = multiply(
        withdrawalsInUBT,
        this.ubtNativePrice
      );

      const value = formatToNative(monthTotalWithdrawalsNative);
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

      const monthSavedFees = fromWei(
        this.receipt.savedFees,
        getUBTAssetData(this.networkInfo.network).decimals
      );

      const monthSavedFeesNative = multiply(
        monthSavedFees,
        this.ubtNativePrice
      );
      return `$${formatToNative(monthSavedFeesNative)}`;
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

      const monthPaidToTreasury = fromWei(
        this.receipt.paidToTreasury,
        getUBTAssetData(this.networkInfo.network).decimals
      );
      const monthPaidToTreasuryNative = multiply(
        monthPaidToTreasury,
        this.ubtNativePrice
      );
      return `$${formatToNative(monthPaidToTreasuryNative)}`;
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

      const earnedInUBT = fromWei(
        this.receipt.earnedThisMonth,
        getUBTAssetData(this.networkInfo.network).decimals
      );
      const monthEarnedNative = multiply(earnedInUBT, this.ubtNativePrice);

      const value = formatToNative(monthEarnedNative);
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

      const earnedInUBT = fromWei(
        this.receipt.avgDailyEarnings,
        getUBTAssetData(this.networkInfo.network).decimals
      );
      const monthAverageEarnedNative = multiply(
        earnedInUBT,
        this.ubtNativePrice
      );

      const value = formatToNative(monthAverageEarnedNative);
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
      receipt = await this.ubtReceipt(year, month);
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
