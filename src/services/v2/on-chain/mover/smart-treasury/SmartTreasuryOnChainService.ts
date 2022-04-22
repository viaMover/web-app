import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { ISmartTreasuryBonusBalanceExecutor } from '@/services/v2/on-chain/mover/ISmartTreasuryBonusBalanceExecutor';
import {
  CompoundEstimateResponse,
  HolyHandContract
} from '@/services/v2/on-chain/mover/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import {
  add,
  divide,
  fromWei,
  greaterThanOrEqual,
  isEqual,
  isFinite,
  isNaN,
  lessThanOrEqual,
  multiply,
  toWei
} from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getMoboAssetData,
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData,
  HOLY_HAND_ABI,
  lookupAddress,
  lookupConstant,
  NFT_RARI_ABI,
  POWERCARD_STAKER_ABI,
  SMART_TREASURY_ABI
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, SmallTokenInfo } from '@/wallet/types';

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
  protected readonly holyHandContract: HolyHandContract | undefined;
  protected readonly smartTreasuryContract: SmartTreasuryContract | undefined;
  protected readonly powercardContract: PowercardContract | undefined;
  protected readonly powercardStakerContract:
    | PowercardStakerContract
    | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected readonly moveAssetData: SmallTokenInfo;
  protected readonly moveEthLPAssetData: SmallTokenInfo;
  public static readonly PowercardMaxActiveTimeSeconds = 2592000;
  public static readonly PowercardMaxCooldownTimeSeconds = 5184000;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);
    this.setSmartTreasuryBonusBalanceExecutor(this);

    this.holyHandContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      HOLY_HAND_ABI as AbiItem[]
    );
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

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    actionGasLimit: string,
    approveGasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt | never> {
    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        async () =>
          this.deposit(
            inputAsset,
            inputAmount,
            actionGasLimit,
            changeStepToProcess
          ),
        changeStepToProcess,
        approveGasLimit
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to deposit',
        data: {
          inputAsset,
          inputAmount,
          actionGasLimit,
          approveGasLimit,
          error
        }
      });
      throw new OnChainServiceError('Failed to execute deposit').wrap(error);
    }
  }

  public async estimateDepositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> {
    const approveGasLimit = await this.estimateApproveIfNeeded(
      inputAsset,
      inputAmount,
      lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
    );

    if (approveGasLimit !== undefined) {
      return {
        error: false,
        approveGasLimit: approveGasLimit,
        actionGasLimit: ethDefaults.basic_holy_savings_plus_deposit
      };
    }

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Smart Treasury deposit',
        this.network
      );
    }

    if (
      !(
        sameAddress(inputAsset.address, this.moveAssetData.address) ||
        sameAddress(inputAsset.address, this.moveEthLPAssetData.address)
      )
    ) {
      throw new OnChainServiceError(
        'Wrong token used for Smart Treasury Deposit',
        inputAsset
      );
    }

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    const moveAmount = sameAddress(
      inputAsset.address,
      this.moveAssetData.address
    )
      ? inputAmountInWEI
      : '0';
    const moveEthAmount = sameAddress(
      inputAsset.address,
      this.moveEthLPAssetData.address
    )
      ? inputAmountInWEI
      : '0';

    try {
      const gasLimitObj = await this.holyHandContract.methods
        .depositToTreasury(moveAmount, moveEthAmount)
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit: empty gas limit',
        data: {
          inputAsset,
          inputAmount,
          moveAmount,
          moveEthAmount
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit',
        data: {
          error,
          inputAsset,
          inputAmount,
          moveAmount,
          moveEthAmount
        }
      });
      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async withdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    actionGasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return await this.withdraw(
        outputAsset,
        outputAmount,
        actionGasLimit,
        changeStepToProcess
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to withdraw',
        data: {
          outputAsset,
          outputAmount,
          actionGasLimit,
          error
        }
      });

      throw error;
    }
  }

  public async estimateWithdrawCompound(
    outputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> {
    if (
      !(
        sameAddress(outputAsset.address, this.moveAssetData.address) ||
        sameAddress(outputAsset.address, this.moveEthLPAssetData.address)
      )
    ) {
      throw new OnChainServiceError(
        'Wrong token used for Smart Treasury Withdraw',
        outputAsset
      );
    }

    if (this.smartTreasuryContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Smart Treasury withdraw',
        this.network
      );
    }

    const outputAmountInWEI = toWei(inputAmount, outputAsset.decimals);

    const moveAmount = sameAddress(
      outputAsset.address,
      this.moveAssetData.address
    )
      ? outputAmountInWEI
      : '0';
    const moveEthAmount = sameAddress(
      outputAsset.address,
      this.moveEthLPAssetData.address
    )
      ? outputAmountInWEI
      : '0';

    try {
      const gasLimitObj = await this.smartTreasuryContract.methods
        .withdraw(moveAmount, moveEthAmount)
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw: empty gas limit',
        data: {
          outputAsset,
          inputAmount,
          moveAmount,
          moveEthAmount
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw',
        data: {
          error,
          inputAmount,
          moveAmount,
          moveEthAmount
        }
      });
      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async claimAndBurnCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    actionGasLimit: string,
    approveGasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        async () =>
          this.claimAndBurn(
            inputAsset,
            inputAmount,
            actionGasLimit,
            changeStepToProcess
          ),
        changeStepToProcess,
        approveGasLimit
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to claim & burn',
        data: {
          inputAsset,
          inputAmount,
          actionGasLimit,
          approveGasLimit,
          error
        }
      });

      throw error;
    }
  }

  public async estimateClaimAndBurnCompound(
    inputAsset: SmallToken,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> {
    const approveGasLimit = await this.estimateApproveIfNeeded(
      inputAsset,
      inputAmount,
      lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
    );

    if (approveGasLimit !== undefined) {
      return {
        error: false,
        approveGasLimit: approveGasLimit,
        actionGasLimit: ethDefaults.basic_holy_savings_plus_deposit
      };
    }

    if (!sameAddress(inputAsset.address, this.moveAssetData.address)) {
      throw new OnChainServiceError(
        `Wrong token passed to claimAndBurn: only ${this.moveAssetData.symbol} is allowed`
      );
    }

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Treasury claim & burn',
        this.network
      );
    }

    try {
      const gasLimitObj = await this.holyHandContract.methods
        .claimAndBurn(toWei(inputAmount, inputAsset.decimals))
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate claim & burn: empty gas limit',
        data: {
          inputAsset,
          inputAmount
        }
      });

      return { error: true, approveGasLimit: '0', actionGasLimit: '0' };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate claim & burn',
        data: {
          error,
          inputAsset,
          inputAmount
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async claimAndBurnMOBO(
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return await new Promise<TransactionReceipt>((resolve, reject) => {
        if (this.smartTreasuryContract === undefined) {
          throw new NetworkFeatureNotSupportedError(
            'Treasury claim & burn MOBO',
            this.network
          );
        }

        this.wrapWithSendMethodCallbacks(
          this.smartTreasuryContract.methods
            .claimUSDCforBonus()
            .send(this.getDefaultTransactionsParams(gasLimit)),
          resolve,
          reject,
          changeStepToProcess,
          {
            gasLimit
          }
        );
      });
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to claim & burn',
        data: {
          gasLimit,
          error
        }
      });

      throw error;
    }
  }

  public async estimateClaimAndBurnMOBO(): Promise<CompoundEstimateResponse> {
    if (this.smartTreasuryContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Treasury claim & burn MOBO',
        this.network
      );
    }

    try {
      const gasLimitObj = await this.smartTreasuryContract.methods
        .claimUSDCforBonus()
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate claim & burn MOBO: empty gas limit'
      });

      return { error: true, approveGasLimit: '0', actionGasLimit: '0' };
    } catch (error) {
      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async stakePowercardCompound(
    actionGasLimit: string,
    approveGasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return await this.executeTransactionWithApproveExt(
        async () => this.stakePowercard(actionGasLimit, changeStepToProcess),
        async () => this.isPowercardApproved(),
        async () =>
          this.approvePowercard(
            approveGasLimit,
            lookupAddress(this.network, 'POWERCARD_STAKER'),
            changeStepToProcess
          )
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to stake powercard',
        data: {
          actionGasLimit,
          approveGasLimit,
          error
        }
      });
      throw new OnChainServiceError('Failed to stake powercard').wrap(error);
    }
  }

  public async estimateStakePowercardCompound(): Promise<CompoundEstimateResponse> {
    let isApproved = false;
    try {
      isApproved = await this.isPowercardApproved();
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate stake: failed "isPowercardApproved" check',
        data: {
          error
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }

    if (!isApproved) {
      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Needs approve'
      });

      try {
        const approveGasLimit = await this.estimatePowercardApprove(
          lookupAddress(this.network, 'POWERCARD_STAKER')
        );

        return {
          error: false,
          actionGasLimit: ethDefaults.basic_approval,
          approveGasLimit: approveGasLimit
        };
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate stake: failed "approve" estimation',
          data: {
            error
          }
        });

        return {
          error: true,
          actionGasLimit: '0',
          approveGasLimit: '0'
        };
      }
    }

    try {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard stake',
          this.network
        );
      }

      const gasLimitObj = await this.powercardStakerContract.methods
        .stakePowercard()
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate stake: empty gas limit'
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate stake',
        data: {
          error
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async unstakePowercardCompound(
    actionGasLimit: string,
    approveGasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return this.executeTransactionWithApproveExt(
        async () => this.unstakePowercard(actionGasLimit, changeStepToProcess),
        async () => this.isPowercardApproved(),
        async () =>
          this.approvePowercard(
            approveGasLimit,
            lookupAddress(this.network, 'POWERCARD_STAKER'),
            changeStepToProcess
          )
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to unstake powercard',
        data: {
          error,
          actionGasLimit
        }
      });
      throw error;
    }
  }

  public async estimateUnstakePowercardCompound(): Promise<CompoundEstimateResponse> {
    let isApproved = false;
    try {
      isApproved = await this.isPowercardApproved();
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message:
          'Failed to estimate unstake: failed "isPowercardApproved" check',
        data: {
          error
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }

    if (!isApproved) {
      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Needs approve'
      });

      try {
        const approveGasLimit = await this.estimatePowercardApprove(
          lookupAddress(this.network, 'POWERCARD_STAKER')
        );

        return {
          error: false,
          actionGasLimit: ethDefaults.basic_approval,
          approveGasLimit: approveGasLimit
        };
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate unstake: failed "approve" estimation',
          data: {
            error
          }
        });

        return {
          error: true,
          actionGasLimit: '0',
          approveGasLimit: '0'
        };
      }
    }

    try {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard unstake',
          this.network
        );
      }

      const gasLimitObj = await this.powercardStakerContract.methods
        .unstakePowercard()
        .estimateGas({ from: this.currentAddress });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate unstake: empty gas limit'
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate unstake',
        data: {
          error
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public calculateTreasuryBoost(
    treasuryBalanceMove: string,
    treasuryBalanceLP: string,
    walletBalanceMove: string,
    walletBalanceLP: string,
    powercardState: PowercardState
  ): string {
    return SmartTreasuryOnChainService.calculateTreasuryBoost(
      treasuryBalanceMove,
      treasuryBalanceLP,
      walletBalanceMove,
      walletBalanceLP,
      powercardState
    );
  }

  public static calculateTreasuryBoost(
    treasuryBalanceMove: string,
    treasuryBalanceLP: string,
    walletBalanceMove: string,
    walletBalanceLP: string,
    powercardState: PowercardState
  ): string {
    const tokenWeight = '1';
    const lpWeight = '2.5';

    let boostMove = multiply(
      divide(treasuryBalanceMove, add(walletBalanceMove, treasuryBalanceMove)),
      tokenWeight
    );

    if (isNaN(boostMove) || !isFinite(boostMove)) {
      boostMove = '0';
    }

    let boostLP = multiply(
      divide(treasuryBalanceLP, add(walletBalanceLP, treasuryBalanceLP)),
      lpWeight
    );

    if (isNaN(boostLP) || !isFinite(boostLP)) {
      boostLP = '0';
    }

    let boost = add(boostMove, boostLP);
    if (isNaN(+boost)) {
      boost = '0';
    }

    if (powercardState === PowercardState.Staked) {
      return multiply(boost, 2);
    }

    return boost;
  }

  protected async deposit(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    if (
      !(
        sameAddress(inputAsset.address, this.moveAssetData.address) ||
        sameAddress(inputAsset.address, this.moveEthLPAssetData.address)
      )
    ) {
      throw new OnChainServiceError(
        'Wrong token used for Smart Treasury Deposit',
        inputAsset
      );
    }

    const moveAmount = sameAddress(
      inputAsset.address,
      this.moveAssetData.address
    )
      ? inputAmountInWEI
      : '0';
    const moveEthAmount = sameAddress(
      inputAsset.address,
      this.moveEthLPAssetData.address
    )
      ? inputAmountInWEI
      : '0';

    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Treasury deposit',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .depositToTreasury(moveAmount, moveEthAmount)
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          moveAmount,
          moveEthAmount,
          gasLimit
        }
      );
    });
  }

  protected async withdraw(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    if (
      !(
        sameAddress(outputAsset.address, this.moveAssetData.address) ||
        sameAddress(outputAsset.address, this.moveEthLPAssetData.address)
      )
    ) {
      throw new OnChainServiceError(
        'Wrong token used for Smart Treasury Withdraw',
        outputAsset
      );
    }

    const outputAmountInWEI = toWei(outputAmount, outputAsset.decimals);

    const moveAmount = sameAddress(
      outputAsset.address,
      this.moveAssetData.address
    )
      ? outputAmountInWEI
      : '0';
    const moveEthAmount = sameAddress(
      outputAsset.address,
      this.moveEthLPAssetData.address
    )
      ? outputAmountInWEI
      : '0';

    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.smartTreasuryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Treasury withdraw',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.smartTreasuryContract.methods
          .withdraw(moveAmount, moveEthAmount)
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          moveAmount,
          moveEthAmount,
          gasLimit
        }
      );
    });
  }

  protected async claimAndBurn(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    if (!sameAddress(inputAsset.address, this.moveAssetData.address)) {
      throw new OnChainServiceError(
        `Wrong token passed to claimAndBurn: only ${this.moveAssetData.symbol} is allowed`
      );
    }

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Treasury claim & burn',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .claimAndBurn(inputAmountInWEI)
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          inputAmountInWEI,
          gasLimit
        }
      );
    });
  }

  protected async stakePowercard(
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard stake',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.powercardStakerContract.methods
          .stakePowercard()
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        { gasLimit }
      );
    });
  }

  protected async unstakePowercard(
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.powercardStakerContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard unstake',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.powercardStakerContract.methods
          .unstakePowercard()
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        { gasLimit }
      );
    });
  }

  protected async isPowercardApproved(): Promise<boolean> {
    return this.wrapWithSentryLogger(async () => {
      if (this.powercardContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard approval check',
          this.network
        );
      }

      return await this.powercardContract.methods
        .isApprovedForAll(
          this.currentAddress,
          lookupAddress(this.network, 'POWERCARD_STAKER')
        )
        .call({ from: this.currentAddress });
    });
  }

  protected async approvePowercard(
    gasLimit: string,
    contractAddress: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    return await new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.powercardContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Powercard approval',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.powercardContract.methods
          .setApprovalForAll(contractAddress, true)
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        { gasLimit, contractAddress }
      );
    });
  }

  protected async estimatePowercardApprove(
    contractAddress: string
  ): Promise<string> {
    if (this.powercardContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Powercard approval estimation',
        this.network
      );
    }

    try {
      const gasLimit = await this.powercardContract.methods
        .setApprovalForAll(contractAddress, true)
        .estimateGas({ from: this.currentAddress });

      if (gasLimit) {
        return gasLimit.toString();
      }

      throw new Error(`empty gas limit`);
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate approve for powercard',
        data: {
          contractAddress,
          error
        }
      });

      throw new OnChainServiceError(
        `Failed to estimate approve for powercard`
      ).wrap(error);
    }
  }
}
