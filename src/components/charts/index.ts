export { default as BarChart } from './bar-chart.vue';
export { default as LineChart } from './line-chart.vue';
export * from './types';

import 'chartjs-adapter-dayjs';

import { Chart, registerables } from 'chart.js';
// import { Chart, registerables, Interaction } from 'chart.js';
// import { CrosshairPlugin, Interpolate } from 'chartjs-plugin-crosshair';
// Chart.register(...registerables, CrosshairPlugin);
// Interaction.modes.interpolate = Interpolate;
Chart.register(...registerables);
