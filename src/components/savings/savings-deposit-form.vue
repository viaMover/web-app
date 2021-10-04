<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="savings_secondary_page-title"
        :description="$t('savings.deposit.txtDepositDescription')"
        :title="$t('savings.deposit.lblDepositInSavings')"
      />
      <div class="savings_secondary_page-token-info">
        <span>{{ estimatedAnnualEarning }}</span>
        <p>{{ $t('savings.deposit.txtYouCouldEarnInYear') }}</p>
      </div>
    </div>
    <div class="savings_secondary_page-body">
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
          type="button"
          @click.capture.stop.prevent="handleOpenSelectModal"
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
          {{
            isNeedTransfer
              ? $t('savings.deposit.txtAssetWillBeConverted')
              : $t('savings.txtUSDCCoinIsAStable')
          }}
        </p>
      </div>
      <form action="#" autocomplete="off" class="form">
        <p>
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          <span class="form-button" @click.capture.stop.prevent="swapTokens">
            {{ currentInputAsset.symbol }}
          </span>
        </p>
        <dynamic-input
          :disabled="loading"
          input-class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          :symbol="currentInputAsset.symbol"
          type="text"
          :value="inputValue"
          @update-value="handleUpdateValue"
        ></dynamic-input>
        <div
          v-if="
            isNeedTransfer && formattedUSDCTotal && selectedMode === 'TOKEN'
          "
          class="form-swap"
        >
          <p>
            {{ $t('savings.deposit.lblSwappingFor') }}
            <picture>
              <img alt="" src="@/assets/images/coin-icon1.png" />
            </picture>
            <span>{{ formattedUSDCTotal }}</span>
          </p>
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          {{ isButtonActive ? $t('savings.lblReviewTransaction') : error }}
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

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
import { CompoudEstimateResponse } from '@/wallet/actions/savings/deposit/depositEstimate';
import {
  calcTransactionFastNativePrice,
  isSubsidizedAllowed
} from '@/wallet/actions/subsidized';
import { getUSDCAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

export default Vue.extend({
  name: 'SavingsDepositForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    ArrowDownIcon,
    DynamicInput
  },
  data() {
    return {
      selectedMode: 'TOKEN' as 'USDC' | 'TOKEN',
      asset: undefined as TokenWithBalance | undefined,
      maxInUSDC: '0' as string,
      amount: '',
      usdcAmount: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      loading: false,
      process: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices',
      'tokens',
      'ethPrice',
      'savingsAPY',
      'usdcPriceInWeth',
      'ethPrice',
      'savingsBalance'
    ]),
    ...mapGetters('account', ['treasuryBonusNative', 'getTokenColor']),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isNeedTransfer(): boolean {
      if (this.asset === undefined) {
        return true;
      }

      return !sameAddress(this.asset.address, this.outputUSDCAsset.address);
    },
    currentInputAsset(): SmallTokenInfoWithIcon {
      if (this.selectedMode === 'TOKEN') {
        return {
          address: this.asset?.address ?? '',
          decimals: this.asset?.decimals ?? 18,
          symbol: this.asset?.symbol ?? '',
          iconURL: this.asset?.logo ?? ''
        };
      } else {
        return this.outputUSDCAsset;
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
        return 'Choose Token';
      }

      if (!notZero(this.amount)) {
        return this.$t('savings.deposit.lblChooseAmount').toString();
      }

      if (greaterThan(this.amount, this.maxInputAmount)) {
        return 'Insufficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    inputValue(): string {
      return this.selectedMode === 'TOKEN' ? this.amount : this.usdcAmount;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.loading;
    },
    estimatedAnnualEarning(): string {
      let possibleSavingsBalance = '0';
      if (this.usdcAmount !== '') {
        possibleSavingsBalance = this.usdcAmount;
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
        return `${formatToDecimals(this.maxInUSDC, 4)} ${
          this.outputUSDCAsset.symbol
        }`;
      }
    },
    formattedUSDCTotal(): string {
      if (this.asset === undefined) {
        return '0';
      }
      let buyedUSDC = '0';

      if (sameAddress(this.asset.address, this.outputUSDCAsset.address)) {
        buyedUSDC = this.amount;
      } else if (this.transferData !== undefined) {
        buyedUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      return `${formatToNative(buyedUSDC)} USDC`;
    }
  },
  mounted() {
    const eth = this.tokens.find((t: TokenWithBalance) => t.address === 'eth');
    if (eth) {
      this.asset = eth;
      this.calcTokenMaxInUSDC(eth);
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    async handleUpdateValue(val: string): Promise<void> {
      await this.updatingValue(val, this.selectedMode);
    },
    async updatingValue(value: string, mode: 'TOKEN' | 'USDC'): Promise<void> {
      console.log('Trying to update value', value, mode);

      if (this.asset === undefined || this.loading) {
        return;
      }

      this.loading = true;

      try {
        if (!this.isNeedTransfer) {
          console.log('Dont need transfer, token is USDC');
          this.transferData = undefined;
          this.amount = value;
          this.usdcAmount = value;
        } else {
          if (mode === 'TOKEN') {
            this.amount = value;
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
            this.usdcAmount = fromWei(
              this.transferData.buyAmount,
              this.outputUSDCAsset.decimals
            );
          } else {
            this.usdcAmount = value;
            const inputInWei = toWei(value, this.outputUSDCAsset.decimals);
            const transferData = await getTransferData(
              this.outputUSDCAsset.address,
              this.asset.address,
              inputInWei,
              false,
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
          this.usdcAmount = '0';
        } else {
          this.amount = '0';
        }
      } finally {
        this.loading = false;
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
    ): Promise<CompoudEstimateResponse> {
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
        console.error(resp.error);
        this.transferError = 'Estimate error';
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
      this.process = true;
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
        this.process = false;
      }

      this.$emit('tx-review', {
        token: this.asset,
        amount: this.amount,
        nativeAmount: this.usdcAmount,
        subsidizedEnabled: subsidizedEnabled,
        estimatedGasCost: subsidizedTxPrice,
        transferData: this.transferData,
        actionGasLimit: actionGasLimit,
        approveGasLimit: approveGasLimit
      });
    },
    swapTokens(): void {
      if (this.isNeedTransfer) {
        if (this.selectedMode === 'TOKEN') {
          this.selectedMode = 'USDC';
        } else {
          this.selectedMode = 'TOKEN';
        }
      }
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.asset === undefined) {
        return;
      }
      await this.updatingValue(this.asset.balance, 'TOKEN');
    },
    async calcTokenMaxInUSDC(token: TokenWithBalance): Promise<void> {
      if (sameAddress(token.address, this.outputUSDCAsset.address)) {
        this.maxInUSDC = token.balance;
        this.selectedMode = 'USDC';
      } else {
        this.loading = true;
        try {
          const inputInWei = toWei(token.balance, token.decimals);
          const transferData = await getTransferData(
            this.outputUSDCAsset.address,
            token.address,
            inputInWei,
            true,
            '0.01',
            this.networkInfo.network
          );
          this.maxInUSDC = fromWei(
            transferData.buyAmount,
            this.outputUSDCAsset.decimals
          );
        } catch (err) {
          Sentry.captureException(err);
          console.error(`transfer error: ${err}`);
          this.maxInUSDC = '0';
        } finally {
          this.loading = false;
        }

        this.selectedMode = 'TOKEN';
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setIsModalDisplayed({
        id: ModalType.SearchToken,
        value: true
      });

      if (token === undefined) {
        return;
      } else {
        this.asset = token;
        this.transferData = undefined;
        this.transferError = undefined;
        this.amount = '';
        this.usdcAmount = '';
        this.calcTokenMaxInUSDC(token);
      }
    }
  }
});
</script>
