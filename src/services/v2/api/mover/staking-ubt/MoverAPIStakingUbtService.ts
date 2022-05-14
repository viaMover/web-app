import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import {
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import {
  StakingUbtActionHistoryItem,
  StakingUbtHourlyBalancesItem,
  StakingUbtInfo,
  StakingUbtInfoAPIResponse,
  StakingUbtMonthBalanceItem,
  StakingUbtReceipt,
  StakingUbtReceiptAPIResponse
} from '@/services/v2/api/mover/staking-ubt/types';
import { isFeatureEnabled } from '@/settings';
import { Network } from '@/utils/networkTypes';

export class MoverAPIStakingUbtService extends MoverAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'staking-ubt.api.service';
  protected isFieldsReducerEnabled: boolean;
  protected readonly useSyntheticData = true;

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL
      })
    );
    this.isFieldsReducerEnabled = isFeatureEnabled(
      'isStakingUbtFieldReducerEnabled',
      network
    );
  }

  public async getInfo(): Promise<StakingUbtInfo | never> {
    const data = (
      await this.client.get<
        MoverAPISuccessfulResponse<StakingUbtInfoAPIResponse>
      >(`/info/${this.currentAddress}`)
    ).data.payload;

    if (data.last12MonthsBalances.length === 0) {
      const last12MonthsBalances = new Array<StakingUbtMonthBalanceItem>(12);
      const startOfCurrentMonth = dayjs().startOf('month');
      for (let i = 0; i < 12; i++) {
        last12MonthsBalances[i] = {
          type: 'staking_ubt_month_balance_item',
          year: startOfCurrentMonth.subtract(i, 'month').year(),
          month: startOfCurrentMonth.subtract(i, 'month').month() + 1,
          earned: 0,
          balance: 0,
          snapshotTimestamp: startOfCurrentMonth.subtract(i, 'month').unix()
        };
      }
      data.last12MonthsBalances = last12MonthsBalances;
    }

    return MoverAPIStakingUbtService.mapInfo(data, this.isFieldsReducerEnabled);
  }

  public async getReceipt(
    year: number,
    month: number
  ): Promise<StakingUbtReceipt | never> {
    const data = (
      await this.client.get<
        MoverAPISuccessfulResponse<StakingUbtReceiptAPIResponse>
      >(`/receipt/${this.currentAddress}/${year}/${month}`)
    ).data.payload;

    return MoverAPIStakingUbtService.mapReceipt(
      data,
      this.isFieldsReducerEnabled
    );
  }

  protected static mapInfo(
    data: StakingUbtInfoAPIResponse,
    isReducerEnabled: boolean
  ): StakingUbtInfo {
    return {
      actionHistory: isReducerEnabled
        ? undefined
        : data.actionHistory
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item): StakingUbtActionHistoryItem => {
              return {
                amount: item.amount,
                block: item.block,
                timestamp: item.timestamp,
                txId: item.txId,
                type: item.type
              };
            }),
      avg30DaysAPY: data.avg30DaysAPY,
      currentBalance: data.currentBalance,
      currentPoolBalance: data.currentPoolBalance,
      earnedThisMonth: data.earnedThisMonth,
      earnedTotal: data.earnedTotal,
      last12MonthsBalances: data.last12MonthsBalances
        .slice()
        .sort((a, b) => a.snapshotTimestamp - b.snapshotTimestamp)
        .map((item): StakingUbtMonthBalanceItem => {
          return {
            balance: item.balance,
            earned: item.earned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'staking_ubt_month_balance_item',
            year: item.year
          };
        })
    };
  }

  protected static mapReceipt(
    data: StakingUbtReceiptAPIResponse,
    isReducerEnabled: boolean
  ): StakingUbtReceipt {
    return {
      avgDailyEarnings: data.avgDailyEarnings,
      earnedThisMonth: data.earnedThisMonth,
      endOfMonthBalance: data.endOfMonthBalance,
      hourlyBalances: isReducerEnabled
        ? undefined
        : data.hourlyBalances
            .slice()
            .sort((a, b) => a.snapshotTimestamp - b.snapshotTimestamp)
            .map((item): StakingUbtHourlyBalancesItem => {
              return {
                balance: item.balance,
                day: item.day,
                hour: item.hour,
                month: item.month,
                snapshotTimestamp: item.snapshotTimestamp,
                type: 'staking_ubt_hourly_balance_item',
                year: item.year
              };
            }),
      monthActionHistory: isReducerEnabled
        ? undefined
        : data.monthActionHistory
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item): StakingUbtActionHistoryItem => {
              return {
                amount: item.amount,
                block: item.block,
                timestamp: item.timestamp,
                txId: item.txId,
                type: item.type
              };
            }),
      paidToTreasury: data.paidToTreasury,
      savedFees: data.savedFees,
      totalDeposits: data.totalDeposits,
      totalWithdrawals: data.totalWithdrawals
    };
  }

  protected lookupBaseURL(): string {
    return 'https://apiview.viamover.com/api/v1/staking-ubt'; // fixme: replace with an actual url
  }
}
