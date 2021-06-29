<template>
  <div class="chart">
    <div class="chart--action-buttons"></div>
    <div class="chart--body">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="chart--info"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Chart, ChartConfiguration } from './bootstrap';
import { ChartData } from './types';

export default Vue.extend({
  name: 'SavingsChart',
  props: {
    chartData: {
      type: Object as PropType<ChartData>,
      required: true
    }
  },
  data() {
    return {
      instance: undefined as Chart | undefined
    };
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
    ): ChartConfiguration<'bar', number[], string | number> {
      return {
        type: 'bar',
        data: {
          labels: template.labels,
          datasets: [
            ...template.datasets.map((item) => {
              const backgroundColor = new Array(item.data.length).fill(
                'rgba(60,60,67,0.3)'
              );
              // backgroundColor[item.data.length - 1] = 'rgba(245,147,174,1)';
              backgroundColor[item.data.length - 1] = 'rgba(251, 157, 83, 1)';

              return {
                ...item,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: backgroundColor,
                backgroundColor: backgroundColor
              };
            })
          ]
        },
        options: {
          interaction: {
            intersect: true,
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
