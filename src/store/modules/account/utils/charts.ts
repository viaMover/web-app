import dayjs from 'dayjs';
import { ChartData, ChartType } from 'chart.js';

import {
  SavingsHourlyBalancesItem,
  SavingsMonthBalanceItem,
  TreasuryHourlyBalancesItem,
  TreasuryMonthBonusesItem
} from '@/services/mover';
import { divide, fromWei, greaterThan, lessThan, sub } from '@/utils/bigmath';
import { dateFromExplicitPair } from '@/utils/time';

type FilterPeriod = 'month' | 'week' | 'day';
export type TItem =
  | TreasuryHourlyBalancesItem
  | SavingsHourlyBalancesItem
  | TreasuryMonthBonusesItem
  | SavingsMonthBalanceItem;
const filterByPeriod = (
  list: Array<TItem>,
  period: FilterPeriod
): Array<TItem> => {
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

export type ChartDataItem = {
  x: string;
  y: number | string;
  meta: TItem;
};

export const buildBalancesChartData = (
  list: Array<TItem>,
  chartType: ChartType,
  filterPeriod: FilterPeriod,
  accentedColor: string,
  defaultColor: string
): ChartData<'line' | 'bar', Array<ChartDataItem>, string> => {
  let hasTrimmedLeft = false;
  let minValue = Infinity;
  let maxValue = -Infinity;

  const source = filterByPeriod(list, filterPeriod).reduce(
    (acc, val, idx, arr) => {
      let valSource: number;
      switch (val.type) {
        case 'savings_hourly_balance_item':
          valSource = val.balance;
          break;
        case 'savings_month_balance_item':
          valSource = val.balance;
          break;
        case 'treasury_hourly_balance_item':
          valSource = val.bonusEarned;
          break;
        case 'treasury_month_bonuses_item':
          valSource = val.bonusesEarned;
          break;
      }

      if (valSource === 0 && !hasTrimmedLeft) {
        return acc;
      }

      const yVal = Number.parseFloat(fromWei(valSource, 6));

      hasTrimmedLeft = true;
      if (lessThan(valSource, minValue)) {
        minValue = yVal;
      }

      if (greaterThan(valSource, maxValue)) {
        maxValue = yVal;
      }

      if (
        'hour' in val &&
        val.hour % DECIMATION_PERIOD !== 0 &&
        ['month', 'week'].includes(filterPeriod)
      ) {
        return acc;
      }

      const label =
        chartType === 'bar'
          ? dateFromExplicitPair(val.year, val.month)
              .format('MMM')
              .toUpperCase()
          : dayjs.unix(val.snapshotTimestamp).toISOString();

      return {
        labels: acc.labels.concat(label),
        datasets: [
          {
            data: acc.datasets[0].data.concat({
              x: label,
              y: yVal,
              meta: val
            }),
            backgroundColor: acc.datasets[0].backgroundColor.concat(
              idx === arr.length - 1 ? accentedColor : defaultColor
            ),
            borderColor: acc.datasets[0].borderColor.concat(
              idx === arr.length - 1 ? accentedColor : defaultColor
            ),
            hoverBackgroundColor: acc.datasets[0].backgroundColor.concat(
              idx === arr.length - 1 ? accentedColor : defaultColor
            ),
            hoverBorderColor: acc.datasets[0].borderColor.concat(
              idx === arr.length - 1 ? accentedColor : defaultColor
            )
          }
        ]
      };
    },
    {
      labels: new Array<string>(),
      datasets: [
        {
          data: new Array<ChartDataItem>(),
          backgroundColor: new Array<string>(),
          borderColor: new Array<string>(),
          hoverBackgroundColor: new Array<string>(),
          hoverBorderColor: new Array<string>()
        }
      ]
    }
  );

  // pre-normalize items to the range of [0, 1]
  source.datasets[0].data = source.datasets[0].data.map((dataItem) => ({
    ...dataItem,
    y: divide(sub(dataItem.y, minValue), sub(maxValue, minValue))
  }));

  return source;
};
