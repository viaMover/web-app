import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-dayjs';

Chart.register(...registerables);

export { Chart, ChartConfiguration };
