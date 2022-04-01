import axios, { AxiosInstance } from 'axios';

import { SuccessfulResponse } from '@/services/mover/responses';
import { MoverAPIService } from '@/services/v2/api/mover';
import { DepositTransactionData } from '@/services/v2/api/mover/savings-plus/types';
import { Network } from '@/utils/networkTypes';

export class SavingsPlusMoverAPIService extends MoverAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'savings-plus.api.service';

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL
      })
    );
  }

  public async getDepositTransactionData(
    inputAmountInWei: string,
    inputAssetAddress: string
  ): Promise<DepositTransactionData> {
    return (
      await this.client.post<SuccessfulResponse<DepositTransactionData>>(
        '/depositTx',
        {
          amount: inputAmountInWei,
          address: inputAssetAddress
        }
      )
    ).data.payload;
  }

  protected lookupBaseURL(): string {
    return 'https://api.viamover.com/api/v1/savingsplus';
  }
}
