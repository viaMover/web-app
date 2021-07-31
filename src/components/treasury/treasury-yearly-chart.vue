<template>
  <div class="">
    <div class="smart-treasury__menu-wrapper-balance">
      <span class="balance">{{ bonusBalance }}</span>
      <p>{{ $t('treasury.lblTreasuryBonusBalance') }}</p>
    </div>
    <div class="smart-treasury__menu-wrapper-graph">
      <p>
        {{
          $t('savings.lblEarnedRelativeMonthlyChange', {
            date: monthName
          })
        }}
        <b>{{ earnedThisMonth }}</b>
      </p>
      <bar-chart :chart-data-source="[]" :is-loading="true" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import dayjs from 'dayjs';

import { formatToNative } from '@/utils/format';

import { BarChart } from '@/components/charts';

export default Vue.extend({
  name: 'TreasuryYearlyChart',
  components: {
    BarChart
  },
  data() {
    return {
      earnedRelativeMonthlyChange: 30.37,
      monthName: dayjs().format('MMMM')
    };
  },
  computed: {
    ...mapGetters('account', {
      treasuryBonusNative: 'treasuryBonusNative',
      treasuryEarnedThisMonthNative: 'treasuryEarnedThisMonthNative'
    }),
    bonusBalance(): string {
      return `$${formatToNative(this.treasuryBonusNative)}`;
    },
    earnedThisMonth(): string {
      return `$${formatToNative(this.treasuryEarnedThisMonthNative)}`;
    }
  }
});
</script>
