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
  ActiveElement,
  ScriptableScaleContext,
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  TimeScale
} from 'chart.js';
