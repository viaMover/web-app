import { HourlyBalancesItem, MonthBalanceItem } from '@/services/mover/savings';
import dayjs from 'dayjs';
import { ChartData } from '@/components/charts';
import { fromWei } from '@/utils/bigmath';

type FilterPeriod = 'all' | 'month' | 'week' | 'day';
const filterByPeriod = (
  list: Array<HourlyBalancesItem | MonthBalanceItem>,
  period: FilterPeriod = 'all'
): Array<HourlyBalancesItem | MonthBalanceItem> => {
  if (period === 'all' || list.length === 0) {
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

export const buildChartData = (
  list: Array<HourlyBalancesItem | MonthBalanceItem>,
  filterPeriod: FilterPeriod
): ChartData => {
  const labels: Array<string> = [];
  const data: Array<number> = [];
  filterByPeriod(list, filterPeriod).forEach((item) => {
    if (item.balance === 0) {
      return;
    }

    if (
      'hour' in item &&
      item.hour % 3 !== 0 &&
      ['all', 'month'].includes(filterPeriod)
    ) {
      return;
    }

    labels.push(dayjs.unix(item.snapshotTimestamp).toISOString());
    data.push(Number.parseFloat(fromWei(item.balance, 6)));
  });

  return {
    labels,
    datasets: [{ data }]
  } as ChartData;
};
