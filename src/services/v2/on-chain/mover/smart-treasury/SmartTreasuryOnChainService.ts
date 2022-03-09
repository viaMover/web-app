import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { ISmartTreasuryBonusBalanceExecutor } from '@/services/v2/on-chain/mover/ISmartTreasuryBonusBalanceExecutor';
import {
  divide,
  fromWei,
  greaterThanOrEqual,
  isEqual,
  isFinite,
  isNaN,
  lessThanOrEqual,
  toWei
} from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getMoboAssetData,
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData,
  lookupConstant,
  NFT_RARI_ABI,
  POWERCARD_STAKER_ABI,
  SMART_TREASURY_ABI
} from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

import { MoverOnChainService } from '../MoverOnChainService';
import {
  PowercardContract,
  PowercardStakerContract,
  PowercardState,
  PowerCardTimings,
  SmartTreasuryContract,
  TreasuryBalancesReturn
} from './types';

export class SmartTreasuryOnChainService
  extends MoverOnChainService
  implements ISmartTreasuryBonusBalanceExecutor
{
  protected readonly sentryCategoryPrefix = 'smart-treasury.on-chain.service';
  protected readonly smartTreasuryContract: SmartTreasuryContract | undefined;
  protected readonly powercardContract: PowercardContract | undefined;
  protected readonly powercardStakerContract:
    | PowercardStakerContract
    | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected readonly moveAssetData: SmallTokenInfo;
  protected readonly moveEthLPAssetData: SmallTokenInfo;
  protected static readonly PowercardMaxActiveTimeSeconds = 2592000;
  protected static readonly PowercardMaxCooldownTimeSeconds = 5184000;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);
    this.setSmartTreasuryBonusBalanceExecutor(this);

    this.smartTreasuryContract = this.createContract(
      'SMART_TREASURY_ADDRESS',
      SMART_TREASURY_ABI as AbiItem[]
    );
    this.powercardContract = this.createContract(
      'POWERCARD',
      NFT_RARI_ABI as AbiItem[]
    );
    this.powercardStakerContract = this.createContract(
      'POWERCARD_STAKER',
      POWERCARD_STAKER_ABI as AbiItem[]
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

  public async getPowercardBalance(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      const id = lookupConstant(this.network, 'POWERCARD_RARI_ID');
      if (this.powercardContract === undefined || id === undefined) {
        throw new NetworkFeatureNotSupportedError('Powercard', this.network);
      }

      const powercardBalanceResponse = await this.powercardContract.methods
        .balanceOf(this.currentAddress, id)
        .call({ from: this.currentAddress });

      return powercardBalanceResponse.toString();
    });
  }

  public async getPowercardState(): Promise<PowercardState> {
    return this.wrapWithSentryLogger(async () => {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard staker',
          this.network
        );
      }

      const powercardStateResponse = await this.powercardStakerContract.methods
        .getPowercardIndex(this.currentAddress)
        .call({ from: this.currentAddress });

      const powercardState = powercardStateResponse.toString();

      if (
        lessThanOrEqual(powercardState, 20) &&
        greaterThanOrEqual(powercardState, 0)
      ) {
        return PowercardState.Staked;
      } else if (isEqual(powercardState, 32768)) {
        return PowercardState.NotStaked;
      } else if (isEqual(powercardState, 32769)) {
        return PowercardState.Cooldown;
      } else {
        throw new OnChainServiceError(`wrong state index: ${powercardState}`);
      }
    });
  }

  public async getPowercardTimings(): Promise<PowerCardTimings> {
    return this.wrapWithSentryLogger(async () => {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard staker',
          this.network
        );
      }

      const remainingTimingsResponse =
        await this.powercardStakerContract.methods
          .getRemainingTimings(this.currentAddress)
          .call({ from: this.currentAddress });

      const activeTimeResponse =
        remainingTimingsResponse.active ?? remainingTimingsResponse[0];

      const cooldownTimeResponse =
        remainingTimingsResponse.cooldown ?? remainingTimingsResponse[1];

      return {
        activeTime: activeTimeResponse.toString(),
        cooldownTime: cooldownTimeResponse.toString()
      };
    });
  }
}
