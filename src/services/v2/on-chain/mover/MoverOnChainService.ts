import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { ContractOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { MoverAPISubsidizedService } from '@/services/v2/api/mover/subsidized';
import { Network } from '@/utils/networkTypes';
import { AddressMapKey, lookupAddress } from '@/wallet/references/data';

import { OnChainService } from '../OnChainService';
import { CustomContractType } from '../types';
import { ISmartTreasuryBonusBalanceExecutor } from './ISmartTreasuryBonusBalanceExecutor';
import {
  PreparedAction,
  SubsidizedTransactionsOnChainService
} from './subsidized';

export abstract class MoverOnChainService extends OnChainService {
  protected subsidizedOnChainService: SubsidizedTransactionsOnChainService;
  protected readonly subsidizedAPIService: MoverAPISubsidizedService;

  /**
   * Constructs new MoverOnChainService with auxiliary services on board to send transactions and check statuses / availability
   * @param currentAddress account address
   * @param network current network
   * @param web3Client `Web3` client
   * @protected
   */
  protected constructor(
    currentAddress: string,
    network: Network,
    web3Client: Web3
  ) {
    super(currentAddress, network, web3Client);

    this.subsidizedAPIService = new MoverAPISubsidizedService(
      currentAddress,
      network
    );
    this.subsidizedOnChainService = new SubsidizedTransactionsOnChainService(
      this.currentAddress,
      this.network,
      this.web3Client
    );
  }

  public async isSubsidizedTransactionAllowed(
    fastGasPriceGWEI: string,
    txGasLimit: string,
    ethPrice: string
  ): Promise<boolean> {
    return this.subsidizedOnChainService.isAllowed(
      fastGasPriceGWEI,
      txGasLimit,
      ethPrice
    );
  }

  public calculateTransactionNativePrice(
    fastGasPriceGWEI: string,
    txGasLimit: string,
    ethPrice: string
  ): string {
    return this.subsidizedOnChainService.calcFastNativePrice(
      fastGasPriceGWEI,
      txGasLimit,
      ethPrice
    );
  }

  protected async prepareSubsidizedAction(
    actionString: string
  ): Promise<PreparedAction> {
    return this.subsidizedOnChainService.prepareSubsidizedAction(actionString);
  }

  public async prepareSubsidizedSendAction(
    to: string,
    tokenAddress: string,
    amount: string
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE SEND TO ${to} TOKEN ${tokenAddress} AMOUNT ${amount}`
    );
  }

  public async prepareSubsidizedSwapAction(
    tokenFromAddress: string,
    tokenToAddress: string,
    amount: string,
    expectedMinimum: string
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE SWAP TOKEN_FROM ${tokenFromAddress} TOKEN_TO ${tokenToAddress} AMOUNT_FROM ${amount} EXPECTED_MINIMUM ${expectedMinimum}`
    );
  }

  /**
   * Sets bonus balance executor that allows to query Smart Treasury bonus balance.
   * @see ISmartTreasuryBonusBalanceExecutor
   * @param executor
   * @protected
   */
  public setSmartTreasuryBonusBalanceExecutor(
    executor?: ISmartTreasuryBonusBalanceExecutor
  ): this {
    this.subsidizedOnChainService.setSmartTreasuryBonusBalanceExecutor(
      executor
    );
    return this;
  }

  /**
   * Creates Mover `CustomContractType` by lookup key, wraps errors internally
   * @param contractAddressMapKey Mover address map key
   * @param jsonInterface An ABI of Smart Contract
   * @param options Smart Contract options
   * @protected
   */
  protected createContract<M = void>(
    contractAddressMapKey: AddressMapKey,
    jsonInterface: AbiItem[] | AbiItem,
    options?: ContractOptions
  ): CustomContractType<M> | undefined {
    const contract = this.createArbitraryContract<M>(
      lookupAddress(this.network, contractAddressMapKey),
      jsonInterface,
      options
    );

    if (contract !== undefined) {
      return contract;
    }

    Sentry.addBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: 'Contract is not available in current network',
      data: {
        network: this.network,
        name: contractAddressMapKey
      }
    });
    console.error(
      'Contract is not available in current network',
      contractAddressMapKey,
      this.network
    );
    return undefined;
  }
}
