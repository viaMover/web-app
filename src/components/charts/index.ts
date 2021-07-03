export { default as BarChart } from './bar-chart.vue';
export { default as LineChart } from './line-chart.vue';
export * from './types';

import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-dayjs';
import 'chartjs-plugin-crosshair';

Chart.register(...registerables);
