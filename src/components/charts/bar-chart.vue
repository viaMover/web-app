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
  ActiveElement,
  ScriptableScaleContext
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
    tickColor: {
      type: String,
      default: 'rgba(60,60,67,0.60)'
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
        | undefined,
      selectedItem: undefined as undefined | ChartDataItem
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

      this.selectedItem = undefined;
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
      chart.config.data.datasets[
        elements[0].datasetIndex
      ].hoverBackgroundColor = backgroundColors;
      chart.config.data.datasets[elements[0].datasetIndex].hoverBorderColor =
        backgroundColors;
      chart.update();

      this.selectedItem = item;
      this.$emit('item-selected', item);
    },
    initChart(): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      const chartInstance = new Chart<'bar', Array<ChartDataItem>, string>(el, {
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
          maintainAspectRatio: false,
          responsive: false,
          normalized: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            },
            title: {
              display: false
            }
          },
          datasets: {
            bar: {
              minBarLength: 10,
              barThickness: 56,
              maxBarThickness: 56
            }
          },
          elements: {
            bar: {
              borderRadius: 4,
              borderWidth: 1,
              borderColor: this.defaultColor,
              backgroundColor: this.defaultColor,
              hoverBackgroundColor: this.defaultColor,
              hoverBorderColor: this.defaultColor,
              borderSkipped: false
            }
          },
          scales: {
            x: {
              time: {
                tooltipFormat: 'DD MMMM YYYY HH:mm'
              },
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                align: 'center',
                font: {
                  style: 'normal',
                  family: 'Medium, sans-serif',
                  lineHeight: '16px',
                  size: 10,
                  weight: 500
                },
                color: (ctx: ScriptableScaleContext) => {
                  const selectedItemIdx =
                    ctx.chart.data.datasets[0].data.findIndex(
                      (val) => val.meta === this.selectedItem
                    );
                  if (
                    selectedItemIdx < 0 &&
                    this.selectedItem === undefined &&
                    ctx.index === ctx.chart.data.datasets[0].data.length - 1
                  ) {
                    return this.accentColor;
                  }

                  return ctx.index === selectedItemIdx
                    ? this.accentColor
                    : this.tickColor;
                },
                maxRotation: 0,
                minRotation: 0,
                padding: 16
              },
              position: 'bottom'
            },
            y: {
              display: false,
              grid: {
                display: false,
                drawBorder: false
              }
            }
          }
        } as ChartOptions<'bar'>
      });
      chartInstance.resize(this.chartData.datasets[0].data.length * 60, 140);

      this.chartInstance = chartInstance;
    }
  }
});
</script>
