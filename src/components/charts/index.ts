export { default as BarChart } from './bar-chart.vue';
export { default as LineChart } from './line-chart.vue';
export * from './types';

import { Chart, registerables, Interaction } from 'chart.js';
import 'chartjs-adapter-dayjs';
import { CrosshairPlugin, Interpolate } from 'chartjs-plugin-crosshair';
Chart.register(...registerables, CrosshairPlugin);
Interaction.modes.interpolate = Interpolate;
