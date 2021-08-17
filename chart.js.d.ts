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
  ScriptableScaleContext
} from 'chart.js';
