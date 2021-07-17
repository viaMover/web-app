<template>
  <div class="chart-group-wrapper">
    <div v-if="isLoading" class="loader">loading...</div>
    <div v-show="!isLoading" class="chart">
      <div class="chart--action-buttons">
        <action-button
          v-for="scope in scopes"
          :key="scope"
          class="black-link"
          @button-click="toggleScope(scope)"
        >
          {{ scope }}
        </action-button>
      </div>
      <div class="chart--body">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import Color from 'color';

import { buildBalancesChartData } from '@/store/modules/account/utils/charts';
import verticalLinePlugin from '@/components/charts/plugins/vertical-line';
import { HourlyBalancesItem } from '@/services/mover/savings';
import { ActionButton } from '@/components/buttons';

const enum Scope {
  month = '1M',
  week = '1W',
  day = '1D'
}

export default Vue.extend({
  name: 'LineChart',
  components: { ActionButton },
  props: {
    accentColor: {
      type: String,
      default: 'rgba(251, 157, 83, 0.8)'
    },
    chartDataSource: {
      type: Array as PropType<Array<HourlyBalancesItem>>,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      scope: Scope.month as Scope,
      scopes: [Scope.day, Scope.week, Scope.month],
      chartInstance: undefined as
        | Chart<'line', Array<number>, string>
        | undefined
    };
  },
  computed: {
    chartData(): ChartData<'line', Array<number>, string> {
      let data;
      switch (this.scope) {
        case Scope.day:
          data = buildBalancesChartData(this.chartDataSource, 'line', 'day');
          break;
        case Scope.week:
          data = buildBalancesChartData(this.chartDataSource, 'line', 'week');
          break;
        case Scope.month:
        default:
          data = buildBalancesChartData(this.chartDataSource, 'line', 'month');
      }

      return data as ChartData<'line', Array<number>, string>;
    },
    backgroundColor(): string {
      return Color(this.accentColor).fade(0.5).hsl().string();
    },
    strokeColor(): string {
      return Color(this.accentColor).darken(0.2).hsl().string();
    }
  },
  watch: {
    chartData(newVal: ChartData<'line', Array<number>, string>) {
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
    toggleScope(scope: Scope): void {
      this.scope = scope;
    },
    initChart(): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      this.chartInstance = new Chart(el, {
        type: 'line',
        data: this.chartData,
        options: {
          fill: true,
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
            },
            decimation: {
              samples: 150,
              algorithm: 'min-max',
              enabled: true
            },
            crosshair: {
              line: {
                color: '#F66', // crosshair line color
                width: 1 // crosshair line width
              },
              sync: {
                enabled: false, // enable trace line syncing with other charts
                group: 1, // chart group
                suppressTooltips: false // suppress tooltips when showing a synced tracer
              },
              zoom: {
                enabled: false, // enable zooming
                zoomboxBackgroundColor: 'rgba(66,133,244,0.2)', // background color of zoom box
                zoomboxBorderColor: '#48F', // border color of zoom box
                zoomButtonText: 'Reset Zoom', // reset zoom button text
                zoomButtonClass: 'reset-zoom' // reset zoom button class
              }
            }
          },
          elements: {
            line: {
              borderColor: this.accentColor,
              backgroundColor: this.backgroundColor,
              cubicInterpolationMode: 'monotone',
              tension: 0.4
            },
            point: {
              borderColor: this.accentColor,
              backgroundColor: this.backgroundColor
            }
          },
          tooltips: {
            mode: 'x',
            intersect: true
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
        } as ChartOptions<'line'>,
        plugins: [
          verticalLinePlugin({
            lineWidth: 1,
            strokeColor: this.strokeColor
          })
        ]
      });
    }
  }
});
</script>
