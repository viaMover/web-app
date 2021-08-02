import { HourlyBalancesItem, MonthBalanceItem } from '@/services/mover/savings';
import dayjs from 'dayjs';
import { fromWei } from '@/utils/bigmath';
import { ChartData, ChartType } from 'chart.js';
import { dateFromExplicitPair } from '@/utils/time';

type FilterPeriod = 'month' | 'week' | 'day';
const filterByPeriod = (
  list: Array<HourlyBalancesItem | MonthBalanceItem>,
  period: FilterPeriod
): Array<HourlyBalancesItem | MonthBalanceItem> => {
  if (period === 'month' || list.length === 0) {
    return list;
  }

  const rightBound = dayjs.unix(list[0].snapshotTimestamp).endOf('month');
  return list
    .slice()
    .filter(
      (value) =>
        rightBound.diff(dayjs.unix(value.snapshotTimestamp), period) < 1
    );
};

const DECIMATION_PERIOD = 12;

export const buildBalancesChartData = (
  list: Array<HourlyBalancesItem | MonthBalanceItem>,
  chartType: ChartType,
  filterPeriod: FilterPeriod
): ChartData<'line' | 'bar', Array<number>, string> => {
  return filterByPeriod(list, filterPeriod).reduce(
    (acc, val) => {
      if (val.balance === 0) {
        return acc;
      }

      if (
        'hour' in val &&
        val.hour % DECIMATION_PERIOD !== 0 &&
        ['month', 'week'].includes(filterPeriod)
      ) {
        return acc;
      }

      return {
        labels: acc.labels.concat(
          chartType === 'bar'
            ? dateFromExplicitPair(val.year, val.month).format('MMM, YY')
            : dayjs.unix(val.snapshotTimestamp).toISOString()
        ),
        datasets: [
          {
            data: acc.datasets[0].data.concat(
              Number.parseFloat(fromWei(val.balance, 6))
            )
          }
        ]
      };
    },
    {
      labels: new Array<string>(),
      datasets: [
        {
          data: new Array<number>()
        }
      ]
    }
  );
};
