import axios, { AxiosInstance } from 'axios';

import { MoverError } from '@/services/v2';
import {
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import { isFeatureEnabled } from '@/settings';
import { getNetwork, Network } from '@/utils/networkTypes';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

import {
  DepositTransactionData,
  SavingsPlusActionHistoryItem,
  SavingsPlusInfo,
  SavingsPlusInfoAPIResponse,
  SavingsPlusMonthBalanceItem,
  WithdrawTransactionData
} from './types';

export class SavingsPlusMoverAPIService extends MoverAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'savings-plus.api.service';
  protected readonly usdcAssetData: SmallTokenInfo;
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
    this.usdcAssetData = getUSDCAssetData(network);
  }

  public async getInfo(): Promise<SavingsPlusInfo> {
    const data = (
      await this.client.get<
        MoverAPISuccessfulResponse<SavingsPlusInfoAPIResponse>
      >(`/info/${this.currentAddress}`)
    ).data.payload;

    return SavingsPlusMoverAPIService.mapInfo(data);
  }

  public async getDepositTransactionData(
    inputAmountInUSDC: string
  ): Promise<DepositTransactionData> {
    const chainId = getNetwork(this.network)?.chainId;
    if (chainId === undefined) {
      throw new MoverError(`Failed to get chainId of network ${this.network}`);
    }

    return (
      await this.client.post<
        MoverAPISuccessfulResponse<DepositTransactionData>
      >('/depositTx', {
        from: chainId,
        amount: inputAmountInUSDC,
        address: this.currentAddress
      })
    ).data.payload;
  }

  public async getWithdrawTransactionData(
    network: Network,
    outputAmountInUSDC: string
  ): Promise<WithdrawTransactionData> {
    const chainId = getNetwork(this.network)?.chainId;
    if (chainId === undefined) {
      throw new MoverError(`Failed to get chainId of network ${this.network}`);
    }

    return (
      await this.client.post<
        MoverAPISuccessfulResponse<WithdrawTransactionData>
      >('/withdrawTx', {
        to: chainId,
        amount: outputAmountInUSDC,
        address: this.currentAddress
      })
    ).data.payload;
  }

  protected static mapInfo(data: SavingsPlusInfoAPIResponse): SavingsPlusInfo {
    return {
      actionHistory: SavingsPlusMoverAPIService.isFieldsReducerEnabled
        ? undefined
        : data.actionHistory.map((item): SavingsPlusActionHistoryItem => {
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
        (item): SavingsPlusMonthBalanceItem => {
          return {
            balance: item.balance,
            earned: item.earned,
            month: item.month,
            snapshotTimestamp: item.snapshotTimestamp,
            type: 'savings_plus_month_balance_item',
            year: item.year
          };
        }
      )
    };
  }

  protected lookupBaseURL(): string {
    return 'https://api.viamover.com/api/v1/savingsplus';
  }
}
