import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { ISmartTreasuryBonusBalanceExecutor } from '@/services/v2/on-chain/mover/ISmartTreasuryBonusBalanceExecutor';
import { divide, fromWei, isFinite, isNaN, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getMoboAssetData,
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData,
  SMART_TREASURY_ABI
} from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

import { NetworkFeatureNotSupportedError } from '../../../NetworkFeatureNotSupportedError';
import { MoverOnChainService } from '../MoverOnChainService';
import { TreasuryBalancesReturn } from './types';
import { SmartTreasuryContract } from './types';

export class SmartTreasuryOnChainService
  extends MoverOnChainService
  implements ISmartTreasuryBonusBalanceExecutor
{
  protected readonly sentryCategoryPrefix = 'smart-treasury.on-chain.service';
  protected readonly smartTreasuryContract: SmartTreasuryContract | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected readonly moveAssetData: SmallTokenInfo;
  protected readonly moveEthLPAssetData: SmallTokenInfo;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client, true);
    this.setSmartTreasuryBonusBalanceExecutor(this);

    this.smartTreasuryContract = this.createContract(
      'SMART_TREASURY_ADDRESS',
      SMART_TREASURY_ABI as AbiItem[]
    );
    this.usdcAssetData = getUSDCAssetData(network);
    this.moveAssetData = getMoveAssetData(network);
    this.moveEthLPAssetData = getMoveWethLPAssetData(network);
  }

  public async getBalance(): Promise<TreasuryBalancesReturn> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury balance',
          this.network
        );
      }

      const userInfoMoveResponse = await this.smartTreasuryContract.methods
        .userInfoMove(this.currentAddress)
        .call({
          from: this.currentAddress
        });

      const moveBalance = fromWei(
        (userInfoMoveResponse.amount ?? userInfoMoveResponse[0]).toString(),
        this.moveAssetData.decimals
      );

      const userInfoMoveEthLPResponse = await this.smartTreasuryContract.methods
        .userInfoMoveEthLP(this.currentAddress)
        .call({
          from: this.currentAddress
        });

      const moveEthLPBalance = fromWei(
        (
          userInfoMoveEthLPResponse.amount ?? userInfoMoveEthLPResponse[0]
        ).toString(),
        this.moveEthLPAssetData.decimals
      );

      return {
        MoveBalance: moveBalance,
        LPBalance: moveEthLPBalance
      };
    });
  }

  public async getBonusBalance(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury bonus balance',
          this.network
        );
      }

      const smBonusResponse = await this.smartTreasuryContract.methods
        .totalBonus(this.currentAddress)
        .call({
          from: this.currentAddress
        });

      return fromWei(
        smBonusResponse.toString(),
        getMoboAssetData(this.network).decimals
      );
    });
  }

  public async getAPY(
    usdcNativePrice: string,
    moveNativePrice: string
  ): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury APY',
          this.network
        );
      }

      const movePriceInUSDC = divide(moveNativePrice, usdcNativePrice);
      const apyInUSDcResponse = await this.smartTreasuryContract.methods
        .getDPYPerMoveToken()
        .call({
          from: this.currentAddress
        });

      let apy = divide(apyInUSDcResponse.toString(), movePriceInUSDC);
      if (isNaN(apy) || !isFinite(apy)) {
        return '0';
      }

      // TODO: hardcode?
      apy = fromWei(apy, 18);
      return apy;
    });
  }

  public async getMaxBurn(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury max burn',
          this.network
        );
      }

      const maxBurnAmountInWEIResponse =
        await this.smartTreasuryContract.methods
          .maxBurnAmount()
          .call({ from: this.currentAddress });

      return fromWei(
        maxBurnAmountInWEIResponse.toString(),
        this.moveAssetData.decimals
      );
    });
  }

  public async getExitingAmount(burnAmount: string): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury exiting amount',
          this.network
        );
      }

      if (burnAmount === '0') {
        return '0';
      }

      const toBurnAmountInWEI = toWei(burnAmount, this.moveAssetData.decimals);

      const exitingAmountInWeiResponse =
        await this.smartTreasuryContract.methods
          .getBurnValue(this.currentAddress, toBurnAmountInWEI)
          .call({ from: this.currentAddress });

      return fromWei(
        exitingAmountInWeiResponse.toString(),
        this.usdcAssetData.decimals
      );
    });
  }

  public async getTotalStakedMove(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury total staked MOVE',
          this.network
        );
      }

      const totalStakedMoveInWeiResponse =
        await this.smartTreasuryContract.methods
          .totalStakedMove()
          .call({ from: this.currentAddress });

      return fromWei(
        totalStakedMoveInWeiResponse.toString(),
        this.moveAssetData.decimals
      );
    });
  }

  public async getTotalStakedMoveEthLP(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Smart Treasury total staked MOVE-ETH LP',
          this.network
        );
      }

      const totalStakedMoveEthLPInWeiResponse =
        await this.smartTreasuryContract.methods
          .totalStakedMoveEthLP()
          .call({ from: this.currentAddress });

      return fromWei(
        totalStakedMoveEthLPInWeiResponse.toString(),
        this.moveEthLPAssetData.decimals
      );
    });
  }
}
