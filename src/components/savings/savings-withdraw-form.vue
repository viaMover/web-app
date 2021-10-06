<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="savings_secondary_page-title"
        :description="$t('savings.withdraw.txtWithdrawDescription')"
        :title="$t('savings.withdraw.lblWithdrawFromSavings')"
      />
      <div class="savings_secondary_page-token-info">
        <span>{{ estimatedAnnualEarning }}</span>
        <p>{{ $t('savings.withdraw.txtIfYouKeepSavings') }}</p>
      </div>
    </div>
    <div class="savings_secondary_page-body">
      <h2>{{ $t('savings.withdraw.lblWhatDoWeWithdraw') }}</h2>
      <div class="info">
        <token-image
          :address="token.address"
          :src="token.logo"
          :symbol="token.symbol"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ token.name }}
            <span>
              {{ token.symbol }}
            </span>
          </p>
        </div>
      </div>
      <div class="available">
        <p>
          {{ $t('savings.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{ $t('savings.txtUSDCCoinIsAStable') }}
        </p>
      </div>
      <form action="#" autocomplete="off" class="form">
        <p>
          {{ $t('savings.withdraw.lblAmountWeWithdrawIn') }}
          <span class="form-button">
            {{ $t('savings.USDC') }}
          </span>
        </p>
        <dynamic-input
          input-class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          :symbol="token.symbol"
          type="text"
          :value="amountToWithdraw"
          @update-value="handleUpdateValue"
        />
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          <div v-if="isProcessing" class="loader-icon">
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

import {
  divide,
  greaterThan,
  isZero,
  lessThan,
  multiply,
  notZero,
  sub
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { estimateWithdrawCompound } from '@/wallet/actions/savings/withdraw/withdrawEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/savings/withdraw/withdrawEstimate';
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
import { DynamicInput } from '@/components/controls';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

export default Vue.extend({
  name: 'SavingsWithdrawForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    DynamicInput
  },
  data() {
    return {
      amountToWithdraw: '' as string,
      isProcessing: false
    };
  },
  computed: {
    ...mapState('account', [
      'tokens',
      'networkInfo',
      'savingsBalance',
      'usdcPriceInWeth',
      'ethPrice',
      'savingsAPY',
      'provider',
      'currentAddress',
      'gasPrices'
    ]),
    ...mapGetters('account', [
      'treasuryBonusNative',
      'getTokenColor',
      'usdcNativePrice'
    ]),

    token(): TokenWithBalance {
      return {
        address: this.USDCAsset.address,
        decimals: this.USDCAsset.decimals,
        symbol: this.USDCAsset.symbol,
        name: 'USDc',
        priceUSD: this.usdcNativePrice,
        logo: this.USDCAsset.iconURL,
        isFavorite: true,
        isVerified: true,
        balance: this.savingsBalance,
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    error(): string | undefined {
      if (!notZero(this.amountToWithdraw)) {
        return this.$t('savings.withdraw.lblChooseAmount').toString();
      }

      if (greaterThan(this.amountToWithdraw, this.token.balance)) {
        return this.$t('lblInsufficientBalance').toString();
      }

      return undefined;
    },
    USDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isButtonActive(): boolean {
      return this.error === undefined;
    },
    formattedMaxAmount(): string {
      return `${formatToDecimals(this.token.balance, 4)} ${this.token.symbol}`;
    },
    estimatedAnnualEarning(): string {
      let possibleSavingsBalance = '0';

      if (this.savingsBalance !== undefined) {
        possibleSavingsBalance = this.savingsBalance;
      }

      if (this.amountToWithdraw !== '') {
        possibleSavingsBalance = sub(
          possibleSavingsBalance,
          this.amountToWithdraw
        );
      }

      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(possibleSavingsBalance, usdcNative);
      let apyNative = multiply(divide(this.savingsAPY, 100), usdcAmountNative);

      if (lessThan(apyNative, '0')) {
        apyNative = '0';
      }

      return `~ $${formatToNative(apyNative)}`;
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleUpdateValue(val: string): void {
      this.amountToWithdraw = val;
    },
    async estimateAction(
      amount: string,
      asset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateWithdrawCompound(
        asset,
        amount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        console.error(resp.error);
        Sentry.captureException("can't estimate savings deposit");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
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

      return isSubsidizedAllowed(
        gasPrice,
        actionGasLimit,
        this.ethPrice,
        this.treasuryBonusNative
      );
    },
    async handleTxReview(): Promise<void> {
      if (!this.isButtonActive) {
        return;
      }

      let subsidizedEnabled = false;
      let subsidizedTxPrice = undefined;
      let actionGasLimit = '0';
      let approveGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.amountToWithdraw,
          this.token
        );

        actionGasLimit = gasLimits.actionGasLimit;
        approveGasLimit = gasLimits.approveGasLimit;

        console.info('Savings withdraw action gaslimit:', actionGasLimit);
        console.info('Savings withdraw approve gaslimit:', approveGasLimit);

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
        token: this.token,
        amount: this.amountToWithdraw,
        subsidizedEnabled: subsidizedEnabled,
        estimatedGasCost: subsidizedTxPrice,
        actionGasLimit: actionGasLimit
      });
    },
    handleSelectMaxAmount(): void {
      if (!this.token) {
        return;
      }
      this.amountToWithdraw = this.token.balance;
    }
  }
});
</script>
