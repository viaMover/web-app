import { ChartDataItem } from '@/store/modules/account/utils/charts';

declare module 'chart.js' {
  interface ChartTypeRegistry {
    bar: {
      defaultDataPoint: number | ChartDataItem;
    };
    line: {
      defaultDataPoint: number | ChartDataItem;
    };
  }
}

export {
  ChartType,
  ChartData,
  ChartOptions,
  ChartEvent,
  Chart,
  Interaction,
  registerables,
  ActiveElement,
  ScriptableScaleContext,
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';
