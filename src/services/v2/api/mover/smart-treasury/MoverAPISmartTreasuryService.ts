import axios, { AxiosInstance } from 'axios';

import { isFeatureEnabled } from '@/settings';
import { Network } from '@/utils/networkTypes';

import { MoverAPIService } from '../moverAPIService';
import { MoverAPISuccessfulResponse } from '../types';
import {
  TreasuryActionHistoryItem,
  TreasuryHourlyBalancesItem,
  TreasuryInfo,
  TreasuryInfoAPIResponse,
  TreasuryMonthBonusesItem,
  TreasuryReceipt,
  TreasuryReceiptAPIResponse
} from './types';

export class MoverAPISmartTreasuryService extends MoverAPIService {
  protected baseURL: string;
  protected readonly sentryCategoryPrefix = 'smart-treasury.api.service';
  protected static readonly isFieldsReducerEnabled = isFeatureEnabled(
    'isMoverAPISmartTreasuryServiceFieldsReducerEnabled'
  );
  protected client: AxiosInstance;

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({ baseURL: this.baseURL })
    );
  }

  protected lookupBaseURL(): string {
    return `https://apiview.viamover.com/api/v1/treasury`;
  }

  public async getInfo(): Promise<TreasuryInfo | never> {
    const data = (
      await this.client.get<
        MoverAPISuccessfulResponse<TreasuryInfoAPIResponse>
      >(`/info/${this.currentAddress}`)
    ).data.payload;

    return MoverAPISmartTreasuryService.mapInfoData(data);
  }

  public async getReceipt(
    year: number,
    month: number
  ): Promise<TreasuryReceipt | never> {
    const data = (
      await this.client.get<
        MoverAPISuccessfulResponse<TreasuryReceiptAPIResponse>
      >(`/receipt/${this.currentAddress}/${year}/${month}`)
    ).data.payload;

    return MoverAPISmartTreasuryService.mapReceiptData(data);
  }

  protected static mapInfoData(data: TreasuryInfoAPIResponse): TreasuryInfo {
    return {
      actionHistory: MoverAPISmartTreasuryService.isFieldsReducerEnabled
        ? undefined
        : data.actionHistory.map((item): TreasuryActionHistoryItem => {
            return {
              amount: item.amount,
              amountLP: item.amountLP,
              block: item.block,
              timestamp: item.timestamp,
              txId: item.txId,
              type: item.type
            };
          }),
      currentStakedMove: data.currentStakedMove,
      currentStakedMoveLP: data.currentStakedMoveLP,
      currentTotalStakedMove: data.currentTotalStakedMove,
      currentTotalStakedMoveLP: data.currentTotalStakedMoveLP,
      earnedThisMonth: data.earnedThisMonth,
      earnedToday: data.earnedToday,
      earnedTotal: data.earnedTotal,
      last12MonthsBonuses: data.last12MonthsBonuses.map(
        (item): TreasuryMonthBonusesItem => {
          return {
            bonusesEarned: item.bonusesEarned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'treasury_month_bonuses_item',
            year: item.year
          };
        }
      ),
      spentThisMonth: data.spentThisMonth,
      spentToday: data.spentToday,
      spentTotal: data.spentTotal
    };
  }

  protected static mapReceiptData(
    data: TreasuryReceiptAPIResponse
  ): TreasuryReceipt {
    return {
      avgDailyEarnings: data.avgDailyEarnings,
      avgDailySpendings: data.avgDailySpendings,
      earnedThisMonth: data.earnedThisMonth,
      endOfMonthBalanceMove: data.endOfMonthBalanceMove,
      endOfMonthBalanceMoveLP: data.endOfMonthBalanceMoveLP,
      hourlyBalances: data.hourlyBalances.map(
        (item): TreasuryHourlyBalancesItem => {
          return {
            bonusEarned: item.bonusEarned,
            day: item.day,
            hour: item.hour,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            year: item.year,
            type: 'treasury_hourly_balance_item'
          };
        }
      ),
      monthActionHistory: MoverAPISmartTreasuryService.isFieldsReducerEnabled
        ? undefined
        : data.monthActionHistory.map((item): TreasuryActionHistoryItem => {
            return {
              amount: item.amount,
              amountLP: item.amountLP,
              block: item.block,
              timestamp: item.timestamp,
              txId: item.txId,
              type: item.type
            };
          }),
      spentThisMonth: data.spentThisMonth,
      totalDepositsMove: data.totalDepositsMove,
      totalDepositsMoveLP: data.totalDepositsMoveLP,
      totalWithdrawalsMove: data.totalWithdrawalsMove,
      totalWithdrawalsMoveLP: data.totalWithdrawalsMoveLP
    };
  }
}
