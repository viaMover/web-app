<template>
  <secondary-page>
    <div class="treasury__menu-wrapper-graph">
      <div class="treasury__menu-wrapper-balance">
        <span class="balance">{{ treasuryBalance }}</span>
        <p class="black">{{ $t('treasury.txtTreasuryEmptyDescription') }}</p>
      </div>
      <bar-chart
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <p class="margin-top">{{ $t('treasury.lblIfYouReserveMoveInST') }}</p>
      <div class="treasury__menu-wrapper-body margin-top-20">
        <div class="line">
          <div>
            <span class="title">{{ currentMaxBoost }}</span>
            <p class="description black">
              {{ $t('treasury.lblMaximumBoost') }}
            </p>
          </div>
          <div>
            <span class="title">{{ currentCostCoverage }}</span>
            <p class="description black">
              {{ $t('treasury.lblGasCostCoverage') }}
            </p>
          </div>
        </div>
        <action-button
          button-class="button button-active"
          :text="$t('treasury.lblStartBoosting')"
          @button-click="handleStartBoosting"
        />
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { TreasuryMonthBonusesItem } from '@/services/mover';
import { formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import BarChart from '@/components/charts/bar-chart.vue';

import { SecondaryPage } from '../layout';

export default Vue.extend({
  name: 'TreasuryEmpty',
  components: {
    BarChart,
    SecondaryPage,
    ActionButton
  },
  computed: {
    treasuryBalance(): string {
      return `~ $${formatToNative(10000)}`;
    },
    currentMaxBoost(): string {
      return `3.5x`;
    },
    currentCostCoverage(): string {
      return `up to 100%`;
    },
    chartDataSource(): Array<TreasuryMonthBonusesItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'treasury_month_bonuses_item',
        bonusesEarned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    }
  },
  methods: {
    handleStartBoosting(): void {
      //TODO
    }
  }
});
</script>
