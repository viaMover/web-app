import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

export { Chart, ChartConfiguration };
