<template>
  <secondary-page hide-title>
    <div>
      <secondary-page-simple-title
        class="manage-balance-wrapper"
        :description="$t('earnings.lblEarningsBalance')"
        :title="olympusBalance"
      />
      <div class="manage-graph-wrapper">
        <bar-chart
          :chart-data-source="chartDataSource"
          :is-loading="isSavingsInfoLoading || savingsInfo === undefined"
          @item-selected="handleItemSelected"
        />
        <p>
          {{ selectedItemPrefix }}
          <b>{{ selectedItemValue }}</b>
        </p>
      </div>
    </div>
    <statement-nav-list
      :button-text="$t('savings.btnView.simple')"
      :icon="$t('savings.icon')"
      :in-progress-text="$t('savings.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="savings-month-stats"
      :title="$t('savings.lblSavingsStatements')"
      wrapper-class="manage-statements-list"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatPercents, formatToNative } from '@/utils/format';

import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import { StatementNavList } from '@/components/statements/statement-nav-list';

export default Vue.extend({
  name: 'EarningsOlympusManageEmpty',
  components: {
    StatementNavList,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    BarChart
  },
  computed: {
    ...mapState('earnings/olympus', {
      apy: 'olympusAPY',
      olympusBalance: 'olympusBalance'
    }),
    ...mapGetters('earnings/olympus', { apyNative: 'apyNative' }),
    savingsBalance(): string {
      return `~ $${formatToNative(this.apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    }
  }
});
</script>
