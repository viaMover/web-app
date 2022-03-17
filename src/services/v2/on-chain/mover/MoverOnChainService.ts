import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { ContractOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/v2/api/0x';
import { MoverAPISubsidizedService } from '@/services/v2/api/mover/subsidized';
import {
  AddTransactionToStoreHandler,
  EthPriceGetterHandler
} from '@/services/v2/on-chain/mover/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { convertStringToHexWithPrefix } from '@/utils/address';
import { multiply } from '@/utils/bigmath';
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
  protected addTransactionToStoreHandler?: AddTransactionToStoreHandler;
  protected ethPriceGetterHandler?: EthPriceGetterHandler;

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

  /**
   * Sets bonus balance executor that allows to query Smart Treasury bonus balance.
   * @see ISmartTreasuryBonusBalanceExecutor
   * @param executor
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
   * Sets callback handler to allow inherited classes to add transactions to the account store
   * @see AccountStoreState
   * @param handler
   */
  public setAddTransactionToStoreHandler(
    handler?: AddTransactionToStoreHandler
  ): this {
    this.addTransactionToStoreHandler = handler;
    return this;
  }

  /**
   * Sets callback handler to allow access to the eth price from account state
   * @see AccountStoreState
   * @param handler
   */
  public setEthPriceGetterHandler(handler?: EthPriceGetterHandler): this {
    this.ethPriceGetterHandler = handler;
    return this;
  }

  protected mapTransferDataToBytes(data?: TransferData): number[] {
    return MoverOnChainService.mapTransferDataToBytes(this.web3Client, data);
  }

  protected static mapTransferDataToBytes(
    web3Client: Web3,
    data?: TransferData
  ): number[] {
    if (data === undefined) {
      return [];
    }

    return Array.prototype.concat(
      web3Client.utils.hexToBytes(data.to),
      web3Client.utils.hexToBytes(data.allowanceTarget),
      web3Client.utils.hexToBytes(
        web3Client.utils.padLeft(convertStringToHexWithPrefix(data.value), 64)
      ),
      web3Client.utils.hexToBytes(data.data)
    );
  }

  protected mapTransferDataToExpectedMinimumAmount(
    data?: TransferData,
    multiplier = '0.85'
  ): string {
    return MoverOnChainService.mapTransferDataToExpectedMinimumAmount(
      data,
      multiplier
    );
  }

  protected static mapTransferDataToExpectedMinimumAmount(
    data?: TransferData,
    multiplier = '0.85'
  ): string {
    if (data === undefined || data.buyAmount === undefined) {
      return '0';
    }

    return new BigNumber(multiply(data.buyAmount, multiplier)).toFixed(0);
  }

  protected mapTransferDataToValue(data?: TransferData): string {
    return MoverOnChainService.mapTransferDataToValue(this.web3Client, data);
  }

  protected static mapTransferDataToValue(
    web3Client: Web3,
    data?: TransferData
  ): string {
    if (data === undefined || data.value === undefined) {
      return '0';
    }

    return web3Client.utils.toHex(data.value);
  }

  protected async prepareSubsidizedAction(
    actionString: string
  ): Promise<PreparedAction> {
    return this.subsidizedOnChainService.prepareSubsidizedAction(actionString);
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

    addSentryBreadcrumb({
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
