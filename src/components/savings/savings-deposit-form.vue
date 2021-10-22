<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="$t('savings.deposit.txtDepositDescription')"
        :title="$t('savings.deposit.lblDepositInSavings')"
      />
      <div class="secondary_page-token-info">
        <span>{{ estimatedAnnualEarning }}</span>
        <p>{{ $t('savings.deposit.txtYouCouldEarnInYear') }}</p>
      </div>
    </div>
    <div class="secondary_page-body">
      <h2>{{ $t('savings.deposit.lblWhatDoWeDeposit') }}</h2>
      <div class="info">
        <token-image
          :address="asset ? asset.address : ''"
          :src="asset ? asset.logo : ''"
          :symbol="asset ? asset.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ asset ? asset.name : '' }}
            <span>
              {{ asset ? asset.symbol : '' }}
            </span>
          </p>
        </div>
        <button
          class="button-active button-arrow"
          :style="selectorStyle"
          type="button"
          @click.stop.prevent="handleOpenSelectModal"
        >
          <arrow-down-icon stroke="#fff" />
        </button>
      </div>
      <div class="available">
        <p>
          {{ $t('savings.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{ description }}
        </p>
      </div>
      <form autocomplete="off" class="form" @submit.prevent.stop="">
        <p>
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          <span class="form-button" @click.capture.stop.prevent="swapTokens">
            {{ currentInputSymbol }}
          </span>
        </p>
        <dynamic-input
          :disabled="isLoading"
          input-class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          :symbol="currentInputSymbol"
          type="text"
          :value="inputValue"
          @update-value="handleUpdateValue"
        />
        <div
          v-if="isSwapNeeded && formattedUSDCTotal && selectedMode === 'TOKEN'"
          class="form-swap"
        >
          <p>
            {{ $t('savings.deposit.lblSwappingFor') }}
            <custom-picture
              alt="USDC"
              class="token"
              :sources="usdcPicture.sources"
              :src="usdcPicture.src"
            />
            <span>{{ formattedUSDCTotal }}</span>
          </p>
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img alt="pending" src="@/assets/images/ios-spinner-white.svg" />
          </div>
          <template v-else>
            {{ isButtonActive ? $t('savings.lblReviewTransaction') : error }}
          </template>
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';
import { Properties as CssProperties } from 'csstype';

import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapError } from '@/services/0x/errors';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  greaterThan,
  isZero,
  multiply,
  notZero,
  toWei
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { estimateDepositCompound } from '@/wallet/actions/savings/deposit/depositEstimate';
import {
  calcTransactionFastNativePrice,
  isSubsidizedAllowed
} from '@/wallet/actions/subsidized';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import { getUSDCAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

type INPUT_MODE = 'NATIVE' | 'TOKEN';

export default Vue.extend({
  name: 'SavingsDepositForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    ArrowDownIcon,
    DynamicInput,
    CustomPicture
  },
  data() {
    return {
      usdcPicture: {
        src: require('@/assets/images/USDC.png'),
        sources: [
          {
            src: require('@/assets/images/USDC@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      selectedMode: 'TOKEN' as INPUT_MODE,
      asset: undefined as TokenWithBalance | undefined,
      amount: '',
      nativeAmount: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      isLoading: true,
      isProcessing: false,
      tokenSelectedByUser: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices',
      'tokens',
      'savingsAPY',
      'usdcPriceInWeth',
      'ethPrice',
      'savingsBalance',
      'nativeCurrency'
    ]),
    ...mapGetters('account', ['treasuryBonusNative', 'getTokenColor']),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    isSwapNeeded(): boolean {
      if (this.asset === undefined) {
        return true;
      }

      return !sameAddress(this.asset.address, this.outputUSDCAsset.address);
    },
    description(): string {
      return (
        this.isSwapNeeded
          ? this.$t('savings.deposit.txtAssetWillBeConverted')
          : this.$t('savings.txtUSDCCoinIsAStable')
      ) as string;
    },
    currentInputSymbol(): string {
      if (this.selectedMode === 'TOKEN') {
        return this.asset?.symbol ?? '';
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    maxInputAmount(): string {
      if (this.asset === undefined) {
        return '0';
      }
      return this.asset.balance;
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      if (!notZero(this.amount)) {
        return this.$t('savings.deposit.lblChooseAmount') as string;
      }

      if (greaterThan(this.amount, this.maxInputAmount)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    inputValue(): string {
      return this.selectedMode === 'TOKEN' ? this.amount : this.nativeAmount;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
    },
    estimatedAnnualEarning(): string {
      let possibleSavingsBalance = '0';
      if (
        this.asset &&
        sameAddress(this.asset.address, this.outputUSDCAsset.address)
      ) {
        possibleSavingsBalance = this.amount;
      } else if (this.transferData !== undefined) {
        possibleSavingsBalance = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      }

      if (this.savingsBalance !== undefined) {
        possibleSavingsBalance = add(
          this.savingsBalance,
          possibleSavingsBalance
        );
      }

      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      const apyNative = multiply(
        divide(this.savingsAPY, 100),
        usdcAmountNative
      );

      return `~ $${formatToNative(apyNative)}`;
    },
    formattedMaxAmount(): string {
      if (this.asset === undefined) {
        return `0`;
      }

      if (this.selectedMode === 'TOKEN') {
        return `${formatToDecimals(this.asset.balance, 4)} ${
          this.asset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.asset.balance, this.asset.priceUSD),
          2,
          BigNumber.ROUND_DOWN
        )} ${this.nativeCurrencySymbol}`;
      }
    },
    formattedUSDCTotal(): string {
      if (this.asset === undefined) {
        return '0';
      }
      let boughtUSDC = '0';

      if (sameAddress(this.asset.address, this.outputUSDCAsset.address)) {
        boughtUSDC = this.amount;
      } else if (this.transferData !== undefined) {
        boughtUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      return `${formatToNative(boughtUSDC)} USDC`;
    },
    selectorStyle(): CssProperties {
      if (this.asset?.color === undefined) {
        return {
          backgroundColor: '#687EE3',
          boxShadow: '0 0 8px #687EE3'
        };
      }

      return {
        backgroundColor: this.asset.color,
        boxShadow: `0 0 8px ${this.asset.color}`
      };
    }
  },
  watch: {
    tokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (!this.tokenSelectedByUser) {
            const eth = newVal.find(
              (t: TokenWithBalance) => t.address === 'eth'
            );
            if (eth) {
              this.asset = eth;
            }
          }
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    async handleUpdateValue(val: string): Promise<void> {
      await this.updatingValue(val, this.selectedMode);
    },
    async updatingValue(value: string, mode: INPUT_MODE): Promise<void> {
      if (this.asset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        if (!this.isSwapNeeded) {
          console.log('Dont need transfer, token is USDC');
          this.transferData = undefined;
          if (mode === 'TOKEN') {
            this.amount = value;
            this.nativeAmount = convertNativeAmountFromAmount(
              value,
              this.asset.priceUSD
            );
          } else {
            this.amount = convertAmountFromNativeValue(
              value,
              this.asset.priceUSD,
              this.asset.decimals
            );
            this.nativeAmount = value;
          }
        } else {
          if (mode === 'TOKEN') {
            this.amount = value;
            this.nativeAmount = new BigNumber(
              convertNativeAmountFromAmount(value, this.asset.priceUSD)
            ).toFixed(2);
            const inputInWei = toWei(value, this.asset.decimals);
            const transferData = await getTransferData(
              this.outputUSDCAsset.address,
              this.asset.address,
              inputInWei,
              true,
              '0.01',
              this.networkInfo.network
            );
            this.transferData = transferData;
            this.transferError = undefined;
          } else {
            this.nativeAmount = value;
            const inputInWei = toWei(
              convertAmountFromNativeValue(
                value,
                this.asset.priceUSD,
                this.asset.decimals
              ),
              this.asset.decimals
            );
            const transferData = await getTransferData(
              this.outputUSDCAsset.address,
              this.asset.address,
              inputInWei,
              true,
              '0.01',
              this.networkInfo.network
            );
            this.transferData = transferData;
            this.transferError = undefined;
            this.amount = fromWei(
              this.transferData.sellAmount,
              this.asset.decimals
            );
          }
        }
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = mapError(err.publicMessage);
        } else {
          this.transferError = 'Exchange error';
          Sentry.captureException(err);
        }
        console.error(`transfer error: ${err}`);
        this.transferData = undefined;
        if (mode === 'TOKEN') {
          this.nativeAmount = '0';
        } else {
          this.amount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    subsidizedTxNativePrice(actionGasLimit: string): string | undefined {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        console.log(
          "With empty parameter we can't calculate subsidized tx native price"
        );
        return undefined;
      }
      return calcTransactionFastNativePrice(
        gasPrice,
        actionGasLimit,
        this.ethPrice
      );
    },
    checkSubsidizedAvailability(actionGasLimit: string): boolean {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        console.log(
          "With empty parameter we don't allow subsidized transaction"
        );
        return false;
      }

      if (this.asset?.address === 'eth') {
        console.info('Subsidizing for deposit ETH denied');
        return false;
      }

      return isSubsidizedAllowed(
        gasPrice,
        actionGasLimit,
        this.ethPrice,
        this.treasuryBonusNative
      );
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken,
      transferData: TransferData | undefined
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateDepositCompound(
        inputAsset,
        this.outputUSDCAsset,
        inputAmount,
        transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        this.transferError = this.$t('estimationError') as string;
        Sentry.captureException("can't estimate savings deposit");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
    },
    async handleTxReview(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }

      let subsidizedEnabled = false;
      let subsidizedTxPrice = undefined;
      let actionGasLimit = '0';
      let approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.amount,
          this.asset,
          this.transferData
        );

        actionGasLimit = gasLimits.actionGasLimit;
        approveGasLimit = gasLimits.approveGasLimit;

        console.info('Savings deposit action gaslimit:', actionGasLimit);
        console.info('Savings deposit approve gaslimit:', approveGasLimit);

        if (!isZero(actionGasLimit)) {
          subsidizedEnabled = this.checkSubsidizedAvailability(actionGasLimit);
          subsidizedTxPrice = this.subsidizedTxNativePrice(actionGasLimit);
        }
      } catch (err) {
        subsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate savings deposit for subs");
      } finally {
        this.isProcessing = false;
      }

      this.$emit('tx-review', {
        token: this.asset,
        amount: this.amount,
        nativeAmount: this.nativeAmount,
        subsidizedEnabled: subsidizedEnabled,
        estimatedGasCost: subsidizedTxPrice,
        transferData: this.transferData,
        actionGasLimit: actionGasLimit,
        approveGasLimit: approveGasLimit
      });
    },
    swapTokens(): void {
      if (this.selectedMode === 'TOKEN') {
        this.selectedMode = 'NATIVE';
      } else {
        this.selectedMode = 'TOKEN';
      }
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }
      if (this.selectedMode === 'TOKEN') {
        await this.updatingValue(this.asset.balance, 'TOKEN');
      } else {
        await this.updatingValue(
          new BigNumber(
            multiply(this.asset.balance, this.asset.priceUSD)
          ).toFixed(2, BigNumber.ROUND_DOWN),
          'NATIVE'
        );
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setIsModalDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true
        }
      });

      if (token === undefined) {
        return;
      } else {
        this.tokenSelectedByUser = true;
        this.asset = token;
        this.transferData = undefined;
        this.transferError = undefined;
        this.amount = '';
        this.nativeAmount = '';
      }
    }
  }
});
</script>
