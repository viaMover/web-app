<template>
  <div class="chart-group-wrapper" :class="wrapperClass">
    <div v-if="isLoading" class="loader">loading...</div>
    <div v-show="!isLoading" class="chart">
      <div class="chart--action-buttons"></div>
      <div class="chart--body">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <div class="chart--info"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Chart, ChartData, ChartOptions } from 'chart.js';

import { buildBalancesChartData } from '@/store/modules/account/utils/charts';
import {
  SavingsMonthBalanceItem,
  TreasuryMonthBonusesItem
} from '@/services/mover';

export default Vue.extend({
  name: 'BarChart',
  props: {
    defaultColor: {
      type: String,
      default: 'rgba(60,60,67,0.3)'
    },
    accentColor: {
      type: String,
      default: 'rgba(251, 157, 83, 1)'
    },
    chartDataSource: {
      type: Array as PropType<
        Array<SavingsMonthBalanceItem | TreasuryMonthBonusesItem>
      >,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    },
    wrapperClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chartInstance: undefined as
        | Chart<'bar', Array<number>, string>
        | undefined
    };
  },
  computed: {
    chartData(): ChartData<'bar', Array<number>, string> {
      return buildBalancesChartData(
        this.chartDataSource,
        'bar',
        'month'
      ) as ChartData<'bar', Array<number>, string>;
    }
  },
  watch: {
    chartData(newVal: ChartData<'bar', Array<number>, string>) {
      if (this.chartInstance === undefined) {
        return;
      }

      this.chartInstance.data.labels = newVal.labels;
      this.chartInstance.data.datasets = newVal.datasets;
      this.chartInstance.update();
    }
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    this.chartInstance?.destroy();
  },
  methods: {
    initChart(): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      this.chartInstance = new Chart<'bar', Array<number>, string>(el, {
        type: 'bar',
        data: this.chartData,
        options: {
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: false,
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          elements: {
            bar: {
              borderRadius: 5,
              borderWidth: 1,
              borderColor: this.accentColor,
              backgroundColor: this.accentColor
            }
          },
          scales: {
            x: {
              time: {
                tooltipFormat: 'DD MMMM YYYY HH:mm'
              },
              grid: {
                display: false
              },
              ticks: {
                align: 'center'
              },
              position: 'bottom'
            },
            y: {
              display: false
            }
          }
        } as ChartOptions<'bar'>
      });
    }
  }
});
</script>
