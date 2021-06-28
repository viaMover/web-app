<template>
  <div class="info info-bordered">
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblBalance', { month: monthName }) }}
      </div>
      <div class="value">{{ balance }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblDeposits', { month: monthName }) }}
      </div>
      <div class="value">{{ deposits }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblWithdrawals', { month: monthName }) }}
      </div>
      <div class="value">{{ withdrawals }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblSavedFees') }}
      </div>
      <div class="value">{{ savedFees }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savings.statement.lblPayoutsToTreasury') }}
      </div>
      <div class="value">{{ payoutsToTreasury }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  data() {
    return {
      balance: 0,
      deposits: 0,
      withdrawals: 0,
      savedFees: 0,
      payoutsToTreasury: 0
    };
  },
  computed: {
    monthName(): string {
      return this.pageDate.format('MMMM');
    }
  }
});
</script>
