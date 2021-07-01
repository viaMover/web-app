<template>
  <div v-cloak v-if="!isLoading" class="chart">
    <div class="chart--action-buttons"></div>
    <div class="chart--body">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="chart--info"></div>
  </div>
  <div v-else class="preload">loading...</div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Chart, ChartConfiguration } from 'chart.js';
import { ChartData } from '../types';
import { mapGetters, mapState } from 'vuex';

export default Vue.extend({
  name: 'WeekSpan',
  data() {
    return {
      instance: undefined as Chart | undefined
    };
  },
  computed: {
    ...mapState('account', { isLoading: 'isSavingsReceiptLoading' }),
    ...mapGetters('account', { chartData: 'savingsLastWeekChartData' })
  },
  watch: {
    chartData(newVal: ChartData): void {
      this.instance?.destroy();
      this.initChart(newVal);
    }
  },
  mounted() {
    this.initChart(this.chartData);
  },
  beforeDestroy() {
    this.instance?.destroy();
    this.instance = undefined;
  },
  methods: {
    getDataset(
      template: ChartData
    ): ChartConfiguration<'line', number[], string | number> {
      return {
        type: 'line',
        data: {
          labels: template.labels,
          datasets: template.datasets.map((item) => ({
            ...item,
            cubicInterpolationMode: 'monotone',
            tension: 0.4
          }))
        },
        options: {
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: false,
          normalized: true,
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              type: 'timeseries',
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
        }
      };
    },
    initChart(template: ChartData): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      this.instance = new Chart(el, this.getDataset(template));
    }
  }
});
</script>
