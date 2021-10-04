import { ChartData, ChartType } from 'chart.js';
import dayjs from 'dayjs';

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
      let shouldTrimLeft: boolean;

      switch (val.type) {
        case 'savings_hourly_balance_item':
          valSource = val.balance;
          shouldTrimLeft = val.balance === 0;
          break;
        case 'savings_month_balance_item':
          valSource = val.earned;
          shouldTrimLeft = val.earned === 0 && val.balance === 0;
          break;
        case 'treasury_hourly_balance_item':
          valSource = val.bonusEarned;
          shouldTrimLeft = val.bonusEarned === 0;
          break;
        case 'treasury_month_bonuses_item':
          valSource = val.bonusesEarned;
          shouldTrimLeft = val.bonusesEarned === 0;
          break;
      }

      if (!hasTrimmedLeft && shouldTrimLeft) {
        return acc;
      }

      const yVal = Number.parseFloat(fromWei(valSource, 6));

      hasTrimmedLeft = true;
      if (lessThan(yVal, minValue)) {
        minValue = yVal;
      }

      if (greaterThan(yVal, maxValue)) {
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

  // if `minValue` and `maxValue` are equal
  // then division by zero occurs
  //
  // in such case we treat all values as equal
  const areEqualValues = minValue === maxValue;

  source.datasets[0].data = source.datasets[0].data.map((dataItem) => {
    if (areEqualValues) {
      return {
        ...dataItem,
        y: '1'
      };
    }

    return {
      ...dataItem,
      y: divide(sub(dataItem.y, minValue), sub(maxValue, minValue))
    };
  });

  return source;
};
