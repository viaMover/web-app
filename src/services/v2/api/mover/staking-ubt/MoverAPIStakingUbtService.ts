import axios, { AxiosInstance } from 'axios';

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
        : data.actionHistory.map((item): StakingUbtActionHistoryItem => {
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
      last12MonthsBalances: data.last12MonthsBalances.map(
        (item): StakingUbtMonthBalanceItem => {
          return {
            balance: item.balance,
            earned: item.earned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'staking_ubt_month_balance_item',
            year: item.year
          };
        }
      )
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
        : data.hourlyBalances.map((item): StakingUbtHourlyBalancesItem => {
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
        : data.monthActionHistory.map((item): StakingUbtActionHistoryItem => {
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
    return 'https://apiview.viamover.com/api/v1/savings'; // fixme: replace with an actual url
  }
}
