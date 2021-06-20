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
import Vue from 'vue';
import { Chart } from 'chart.js';

export default Vue.extend({
  name: 'AssetPriceChart',
  props: {
    assetAddress: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      instance: undefined as Chart | undefined
    };
  },
  computed: {
    chartData(): Array<{ x: number; y: number }> {
      return [];
    }
  },
  watch: {
    chartData(newVal: Array<{ x: number; y: number }>): void {
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
    initChart(dataset: Array<{ x: number; y: number }>): void {
      const el = this.$refs.chartCanvas as HTMLCanvasElement;
      this.instance = new Chart(el, {
        type: 'line',
        data: {
          datasets: [{ data: dataset }]
        }
      });
    }
  }
});
</script>
