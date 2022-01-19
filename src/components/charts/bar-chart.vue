<template>
  <div class="chart-group-wrapper" :class="wrapperClass">
    <PuSkeletonTheme v-if="isLoading" color="#dcdcdc">
      <PuSkeleton
        class="pu-skeleton"
        height="166px"
        :loading="true"
        tag="div"
        width="100%"
      />
    </PuSkeletonTheme>
    <div v-show="!isLoading" class="chart">
      <div class="chart--body">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import {
  ActiveElement,
  Chart,
  ChartData,
  ChartEvent,
  ChartOptions,
  ScriptableScaleContext
} from 'chart.js';

import {
  EthereumMonthBalanceItem,
  OlympusMonthBalanceItem,
  SavingsMonthBalanceItem,
  TreasuryMonthBonusesItem
} from '@/services/mover';
import {
  buildBalancesChartData,
  ChartDataItem,
  TItem
} from '@/store/modules/account/utils/charts';

// TODO: make component redraw itself on color change to reflect application theme change

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
        Array<
          | SavingsMonthBalanceItem
          | TreasuryMonthBonusesItem
          | OlympusMonthBalanceItem
          | EthereumMonthBalanceItem
        >
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
    },
    disableSelecting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartInstance: undefined as
        | Chart<'bar', Array<number>, string>
        | undefined,
      selectedItem: undefined as undefined | TItem
    };
  },
  computed: {
    chartData(): ChartData<'bar', Array<ChartDataItem>, string> {
      return buildBalancesChartData(
        this.chartDataSource,
        'bar',
        'month',
        this.disableSelecting ? this.defaultColor : this.accentColor,
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
      if (elements.length < 1 || this.disableSelecting) {
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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
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
          onHover(event: ChartEvent, chartElements: ActiveElement[]) {
            event.native.target.style.cursor =
              chartElements[0] && !that.disableSelecting
                ? 'pointer'
                : 'default';
          },
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
                  if (this.disableSelecting) {
                    return this.tickColor;
                  }
                  const selectedItemIdx =
                    ctx.chart.data.datasets[0].data.findIndex(
                      (val: ChartDataItem) => val.meta === this.selectedItem
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
      chartInstance.resize(this.chartData.datasets[0].data.length * 60, 176);

      this.chartInstance = chartInstance;
    }
  }
});
</script>
