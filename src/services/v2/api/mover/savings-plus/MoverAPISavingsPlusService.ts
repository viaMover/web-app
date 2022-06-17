import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import { MoverError } from '@/services/v2';
import {
  MoverAPIError,
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import { InvalidNetworkForOperationError } from '@/services/v2/on-chain/mover/savings-plus';
import { isFeatureEnabled } from '@/settings';
import { getNetwork, Network } from '@/utils/networkTypes';

import {
  DepositExecution,
  DepositTransactionData,
  SavingsPlusActionHistoryItem,
  SavingsPlusHourlyBalancesItem,
  SavingsPlusInfo,
  SavingsPlusInfoAPIResponse,
  SavingsPlusMonthBalanceItem,
  SavingsPlusReceipt,
  SavingsPlusReceiptAPIResponse,
  WithdrawAPIErrorCode,
  WithdrawExecution,
  WithdrawTransactionData
} from './types';

export class MoverAPISavingsPlusService extends MoverAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly apiviewClient: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'savings-plus.api.service';
  protected static readonly isFieldsReducerEnabled = isFeatureEnabled(
    'isMoverAPISavingsPlusServiceFieldsReducerEnabled'
  );

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL
      })
    );
    this.apiviewClient = this.applyAxiosInterceptors(
      axios.create({
        baseURL: 'https://apiview.viamover.com/api/v1/savingsplus'
      })
    );
  }

  public async getInfo(): Promise<SavingsPlusInfo> {
    const data = (
      await this.apiviewClient.get<
        MoverAPISuccessfulResponse<SavingsPlusInfoAPIResponse>
      >(`/info/${this.currentAddress}`)
    ).data.payload;

    if (data.last12MonthsBalances.length === 0) {
      const last12MonthsBalances = new Array<SavingsPlusMonthBalanceItem>(12);
      const startOfCurrentMonth = dayjs().startOf('month');
      for (let i = 0; i < 12; i++) {
        last12MonthsBalances[i] = {
          type: 'savings_plus_month_balance_item',
          year: startOfCurrentMonth.subtract(i, 'month').year(),
          month: startOfCurrentMonth.subtract(i, 'month').month() + 1,
          earned: 0,
          balance: 0,
          snapshotTimestamp: startOfCurrentMonth.subtract(i, 'month').unix()
        };
      }
      data.last12MonthsBalances = last12MonthsBalances;
    }

    if (data.avg30DaysAPY === 0) {
      data.avg30DaysAPY = 0.12;
    }

    return MoverAPISavingsPlusService.mapInfo(data);
  }

  public async getDepositTransactionData(
    inputAmountInUSDCWei: string
  ): Promise<DepositTransactionData> {
    const chainId = getNetwork(this.network)?.chainId;
    if (chainId === undefined) {
      throw new MoverError(`Failed to get chainId of network ${this.network}`);
    }

    const data = (
      await this.client.post<
        MoverAPISuccessfulResponse<DepositTransactionData>
      >('/depositTx', {
        from: chainId,
        amount: inputAmountInUSDCWei,
        address: this.currentAddress
      })
    ).data.payload;

    if (
      ![DepositExecution.Direct, DepositExecution.Bridged].includes(
        data.execution
      )
    ) {
      throw new MoverError(
        'Received invalid deposit transaction data. Validation failed',
        {
          data
        }
      );
    }

    return data;
  }

  public async getReceipt(
    year: number,
    month: number
  ): Promise<SavingsPlusReceipt | never> {
    const data = (
      await this.apiviewClient.get<
        MoverAPISuccessfulResponse<SavingsPlusReceiptAPIResponse>
      >(`/receipt/${this.currentAddress}/${year}/${month}`)
    ).data.payload;

    return MoverAPISavingsPlusService.mapReceipt(
      data,
      MoverAPISavingsPlusService.isFieldsReducerEnabled
    );
  }

  public async getWithdrawTransactionData(
    withdrawToNetwork: Network,
    outputAmountInUSDCWei: string
  ): Promise<WithdrawTransactionData> {
    const chainId = getNetwork(withdrawToNetwork)?.chainId;
    if (chainId === undefined) {
      throw new MoverError(
        `Failed to get chainId of network ${withdrawToNetwork}`
      );
    }

    let data;
    try {
      data = (
        await this.client.post<
          MoverAPISuccessfulResponse<WithdrawTransactionData>
        >('/withdrawTx', {
          to: chainId,
          amount: outputAmountInUSDCWei,
          address: this.currentAddress
        })
      ).data.payload;
    } catch (error) {
      if (!(error instanceof MoverAPIError)) {
        throw error;
      }

      // re-wrap the error to be distinctive
      // and allow UI to handle the error as needed
      if (error.shortMessage === WithdrawAPIErrorCode.UnsupportedChain) {
        throw new InvalidNetworkForOperationError(
          this.network,
          Network.polygon
        );
      }

      throw error;
    }

    if (
      ![WithdrawExecution.Direct, WithdrawExecution.Bridged].includes(
        data.execution
      )
    ) {
      throw new MoverError(
        'Received invalid withdraw transaction data. Validation failed',
        {
          data
        }
      );
    }

    return data;
  }

  protected static mapReceipt(
    data: SavingsPlusReceiptAPIResponse,
    isReducerEnabled: boolean
  ): SavingsPlusReceipt {
    return {
      avgDailyEarnings: data.avgDailyEarnings,
      earnedThisMonth: data.earnedThisMonth,
      endOfMonthBalance: data.endOfMonthBalance,
      hourlyBalances: isReducerEnabled
        ? undefined
        : data.hourlyBalances
            .slice()
            .sort((a, b) => a.snapshotTimestamp - b.snapshotTimestamp)
            .map((item): SavingsPlusHourlyBalancesItem => {
              return {
                balance: item.balance,
                day: item.day,
                hour: item.hour,
                month: item.month,
                snapshotTimestamp: item.snapshotTimestamp,
                type: 'savings_plus_hourly_balance_item',
                year: item.year
              };
            }),
      monthActionHistory: isReducerEnabled
        ? undefined
        : data.monthActionHistory
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item): SavingsPlusActionHistoryItem => {
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

  protected static mapInfo(data: SavingsPlusInfoAPIResponse): SavingsPlusInfo {
    return {
      actionHistory: MoverAPISavingsPlusService.isFieldsReducerEnabled
        ? undefined
        : data.actionHistory
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item): SavingsPlusActionHistoryItem => {
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
        .map((item): SavingsPlusMonthBalanceItem => {
          return {
            balance: item.balance,
            earned: item.earned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'savings_plus_month_balance_item',
            year: item.year
          };
        })
    };
  }

  protected lookupBaseURL(): string {
    return 'https://api.viamover.com/api/v1/savingsplus';
  }
}
