<template>
  <div class="info info-bordered">
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblBalance', { month: monthName }) }}
      </div>
      <div class="value">{{ balanceNative }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblDeposits', { month: monthName }) }}
      </div>
      <div class="value">{{ depositsNative }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblWithdrawals', { month: monthName }) }}
      </div>
      <div class="value">{{ withdrawalsNative }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblSavedFees') }}
      </div>
      <div class="value">{{ savedFeesNative }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblPayoutsToTreasury') }}
      </div>
      <div class="value">{{ payoutsToTreasuryNative }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import dayjs from 'dayjs';
import { mapState } from 'vuex';
import { SavingsReceipt } from '@/services/mover';
import { fromWei } from '@/utils/bigmath';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  computed: {
    ...mapState('account', ['savingsReceipt', 'isSavingsReceiptLoading']),
    monthName(): string {
      return this.pageDate.format('MMMM');
    },
    balanceNative(): string {
      if (this.isSavingsReceiptLoading) {
        return 'loading...';
      }

      if (this.savingsReceipt === undefined) {
        return '0';
      }

      const { endOfMonthBalance } = this.savingsReceipt as SavingsReceipt;

      return fromWei(endOfMonthBalance, 6);
    },
    depositsNative(): string {
      if (this.isSavingsReceiptLoading) {
        return 'loading...';
      }

      if (this.savingsReceipt === undefined) {
        return '0';
      }

      const { totalDeposits } = this.savingsReceipt as SavingsReceipt;

      return fromWei(totalDeposits, 6);
    },
    withdrawalsNative(): string {
      if (this.isSavingsReceiptLoading) {
        return 'loading...';
      }

      if (this.savingsReceipt === undefined) {
        return '0';
      }

      const { totalWithdrawals } = this.savingsReceipt as SavingsReceipt;

      return fromWei(-totalWithdrawals, 6);
    },
    savedFeesNative(): string {
      if (this.isSavingsReceiptLoading) {
        return 'loading...';
      }

      if (this.savingsReceipt === undefined) {
        return '0';
      }

      // TODO: compute
      return '0';
    },
    payoutsToTreasuryNative(): string {
      if (this.isSavingsReceiptLoading) {
        return 'loading...';
      }

      if (this.savingsReceipt === undefined) {
        return '0';
      }

      // TODO: compute
      return '0';
    }
  }
});
</script>
