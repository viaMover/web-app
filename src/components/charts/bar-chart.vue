<template>
  <div class="chart-group-wrapper" :class="wrapperClass">
    <PuSkeletonTheme color="#dcdcdc">
      <PuSkeleton
        v-if="isLoading"
        class="pu-skeleton"
        height="140px"
        :loading="true"
        tag="div"
        width="100%"
      />
    </PuSkeletonTheme>
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
import {
  Chart,
  ChartData,
  ChartOptions,
  ChartEvent,
  ActiveElement
} from 'chart.js';

import {
  buildBalancesChartData,
  ChartDataItem
} from '@/store/modules/account/utils/charts';
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
    chartData(): ChartData<'bar', Array<ChartDataItem>, string> {
      return buildBalancesChartData(
        this.chartDataSource,
        'bar',
        'month',
        this.accentColor,
        this.defaultColor
      ) as ChartData<'bar', Array<ChartDataItem>, string>;
    }
  },
  watch: {
    chartData(newVal: ChartData<'bar', Array<ChartDataItem>, string>) {
      if (this.chartInstance === undefined) {
        return;
      }

      this.$emit('item-selected', undefined);

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
    onClick(event: ChartEvent, elements: ActiveElement[], chart: Chart): void {
      if (elements.length < 1) {
        return;
      }

      const item = chart.getDatasetMeta(elements[0].datasetIndex)._dataset.data[
        elements[0].index
      ]?.meta;
      if (item === undefined) {
        return;
      }

      const datasetLength =
        chart.config.data.datasets[elements[0].datasetIndex].data.length;

      const backgroundColors = new Array(datasetLength).fill(this.defaultColor);
      backgroundColors[elements[0].index] = this.accentColor;

      chart.config.data.datasets[elements[0].datasetIndex].backgroundColor =
        backgroundColors;
      chart.config.data.datasets[elements[0].datasetIndex].borderColor =
        backgroundColors;
      chart.update();

      this.$emit('item-selected', item);
    },
    initChart(): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      this.chartInstance = new Chart<'bar', Array<ChartDataItem>, string>(el, {
        type: 'bar',
        data: this.chartData,
        options: {
          events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: true,
          onClick: this.onClick,
          responsive: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
          elements: {
            bar: {
              borderRadius: 5,
              borderWidth: 1,
              borderColor: this.defaultColor,
              backgroundColor: this.defaultColor
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
