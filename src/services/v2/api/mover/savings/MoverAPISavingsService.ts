import axios, { AxiosInstance } from 'axios';

import { isFeatureEnabled } from '@/settings';
import { Network } from '@/utils/networkTypes';

import MoverAPIService from '../MoverAPIService';
import { SuccessfulResponse } from '../types';
import {
  SavingsActionHistoryItem,
  SavingsHourlyBalancesItem,
  SavingsInfo,
  SavingsInfoAPIResponse,
  SavingsMonthBalanceItem,
  SavingsReceipt,
  SavingsReceiptAPIResponse
} from './types';

export default class MoverAPISavingsService extends MoverAPIService {
  protected readonly baseURL: string;
  protected readonly sentryCategoryPrefix = 'savings.api.service';
  protected static readonly isFieldsReducerEnabled = isFeatureEnabled(
    'isMoverAPISavingsServiceFieldsReducerEnabled'
  );
  protected readonly client: AxiosInstance;

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({ baseURL: this.baseURL })
    );
  }

  public async getInfo(): Promise<SavingsInfo | never> {
    const data = (
      await this.client.get<SuccessfulResponse<SavingsInfoAPIResponse>>(
        `/info/${this.currentAddress}`
      )
    ).data.payload;

    return MoverAPISavingsService.mapInfo(data);
  }

  public async getReceipt(
    year: number,
    month: number
  ): Promise<SavingsReceipt | never> {
    const data = (
      await this.client.get<SuccessfulResponse<SavingsReceiptAPIResponse>>(
        `/receipt/${this.currentAddress}/${year}/${month}`
      )
    ).data.payload;

    return MoverAPISavingsService.mapReceipt(data);
  }

  protected static mapInfo(data: SavingsInfoAPIResponse): SavingsInfo {
    return {
      actionHistory: MoverAPISavingsService.isFieldsReducerEnabled
        ? undefined
        : data.actionHistory.map((item): SavingsActionHistoryItem => {
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
        (item): SavingsMonthBalanceItem => {
          return {
            balance: item.balance,
            earned: item.earned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'savings_month_balance_item',
            year: item.year
          };
        }
      )
    };
  }

  protected static mapReceipt(data: SavingsReceiptAPIResponse): SavingsReceipt {
    return {
      avgDailyEarnings: data.avgDailyEarnings,
      earnedThisMonth: data.earnedThisMonth,
      endOfMonthBalance: data.endOfMonthBalance,
      hourlyBalances: MoverAPISavingsService.isFieldsReducerEnabled
        ? undefined
        : data.hourlyBalances.map((item): SavingsHourlyBalancesItem => {
            return {
              balance: item.balance,
              day: item.day,
              hour: item.hour,
              month: item.month,
              snapshotTimestamp: item.snapshotTimestamp,
              type: 'savings_hourly_balance_item',
              year: item.year
            };
          }),
      monthActionHistory: MoverAPISavingsService.isFieldsReducerEnabled
        ? undefined
        : data.monthActionHistory.map((item): SavingsActionHistoryItem => {
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
    return `https://apiview.viamover.com/api/v1/savings`;
  }
}
