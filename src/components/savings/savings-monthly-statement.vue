<template>
  <statement-list wrapper-class="savings-statements__wrapper-list">
    <statement-list-item
      :description="$t('savings.statement.lblBalance', { month: monthName })"
      :value="balanceNative"
    />
    <statement-list-item
      :description="$t('savings.statement.lblDeposits', { month: monthName })"
      :value="depositsNative"
    />
    <statement-list-item
      :description="
        $t('savings.statement.lblWithdrawals', { month: monthName })
      "
      :value="withdrawalsNative"
    />
    <statement-list-item
      :description="$t('savings.statement.lblSavedFees')"
      :value="savedFeesNative"
    />
    <statement-list-item
      :description="$t('savings.statement.lblPayoutsToTreasury')"
      :value="payoutsToTreasuryNative"
    />
  </statement-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import dayjs from 'dayjs';
import { mapState } from 'vuex';
import { SavingsReceipt } from '@/services/mover';
import { fromWei } from '@/utils/bigmath';

import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  components: {
    StatementList,
    StatementListItem
  },
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
