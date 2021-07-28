<template>
  <div class="modal-wrapper-info">
    <div>
      <h3 v-if="headerLabel" class="modal-wrapper-info-title">
        {{ headerLabel }}
      </h3>
      <span v-else>&nbsp;</span>
    </div>
    <form-loader v-if="loaderStep != undefined" :step="loaderStep" />
    <form v-else>
      <div class="modal-wrapper-info-items">
        <asset-field
          :amount="input.amount"
          :asset="input.asset"
          field-role="input"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxInputAmount"
          :native-amount="input.nativeAmount"
          treasury-only
          use-wallet-tokens
          @update-amount="handleUpdateInputAmount"
          @update-asset="handleUpdateInputAsset"
          @update-native-amount="handleUpdateInputNativeAmount"
        />
      </div>
      <div class="modal-wrapper-info-buttons">
        <button
          class="tx-details"
          :class="{ disabled: !isInfoAvailable }"
          type="button"
          @click="expandInfo"
        >
          <img src="@/assets/images/swap-details.png" />
          <span>Transaction Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">New smart treasury boost</p>
            <div class="value">
              <span>{{ newBoost }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-wrapper-info-button">
        <action-button
          :button-class="buttonClass"
          :disabled="!actionAvaialble"
          :text="actionButtonText"
          @button-click="handleExecuteDeposit"
        />
      </div>
      <gas-selector
        :approve-gas-limit="approveGasLimit"
        :avaialble-gas-modes="availableGasModes"
        :txn-gas-limit="allGasLimit"
        @selected-gas-changed="handleSelectedGasChanged"
      />
      <div v-if="showFooter" class="modal-info-footer">
        <p>
          There are two boost options. Reserving
          <span class="icon getShadow">
            <img
              alt="coin"
              src="@/assets/images/coin-icon2.jpg"
              style="box-shadow: rgb(182, 222, 49) 0px 0px 16px"
            />
          </span>
          MOVE tokens will increase (1x) your rewards share based on the total
          amount of the tokens you have reserved. Reserving
          <span class="icon-wrapper getShadow">
            <span class="icon-left getShadow">
              <img
                alt="coin"
                src="@/assets/images/coin-icon2.jpg"
                style="box-shadow: rgb(182, 222, 49) 0px 0px 16px"
              />
            </span>
            <span class="icon-right getShadow">
              <img
                alt="coin"
                src="@/assets/images/coin-icon3.jpg"
                style="box-shadow: rgb(100, 124, 236) 0px 0px 16px"
              />
            </span>
          </span>
          MOVE-ETH LP tokens will multiply by 2,5 (2.5x) your rewards share
          based on the total amount of LP tokens you have reserved.
        </p>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance, SmallToken } from '@/wallet/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import { mapState } from 'vuex';
import { add, divide, greaterThan, multiply, notZero } from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { Step } from '../controls/form-loader.vue';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import { depositCompound } from '@/wallet/actions/treasury/deposit/deposit';
import { estimateDepositCompound } from '@/wallet/actions/treasury/deposit/depositEstimate';
import { sameAddress } from '@/utils/address';
import { formatToDecimals } from '@/utils/format';

export default Vue.extend({
  name: 'TreasuryIncreaseBoostForm',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    FormLoader
  },
  data() {
    return {
      loaderStep: undefined as Step | undefined,
      infoExpanded: false,
      input: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      depositGasLimit: '0',
      approveGasLimit: '0',
      transferError: undefined as undefined | string,
      loading: false
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
      'treasuryBalanceMove',
      'treasuryBalanceLP'
    ]),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Increase Boost';
    },
    showFooter(): boolean {
      return this.input.asset === undefined || !notZero(this.input.amount);
    },
    error(): string | undefined {
      if (this.input.asset === undefined) {
        return 'Choose Token';
      }

      if (!notZero(this.input.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.input.amount, this.input.asset.balance)) {
        return 'Inssuficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    newBoost(): string {
      if (this.input.asset === undefined) {
        return '';
      }

      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      const walletAmount = this.input.asset.balance;
      let amountTreasury = '0';
      let boostWeight = '1';
      if (sameAddress(this.input.asset.address, move.address)) {
        amountTreasury = this.treasuryBalanceMove;
        boostWeight = '1';
      } else if (sameAddress(this.input.asset.address, slp.address)) {
        amountTreasury = this.treasuryBalanceLP;
        boostWeight = '2.5';
      }

      let inputedAmount = this.input.amount || '0';
      if (greaterThan(inputedAmount, walletAmount)) {
        inputedAmount = walletAmount;
      }

      let futureBoost = multiply(
        divide(
          add(amountTreasury, inputedAmount),
          add(amountTreasury, walletAmount)
        ),
        boostWeight
      );

      if (isNaN(+futureBoost)) {
        futureBoost = '0';
      }
      return `${formatToDecimals(futureBoost, 1)}x`;
    },
    actionAvaialble(): boolean {
      return this.error === undefined && !this.loading;
    },
    actionButtonText(): string {
      if (this.loading) {
        return 'Loading';
      }
      if (this.error !== undefined) {
        return this.error;
      }

      return '💰 Deposit';
    },
    availableGasModes(): Array<GasMode> {
      return ['low', 'normal', 'high'];
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.depositGasLimit)
      );
      return add(this.approveGasLimit, this.depositGasLimit);
    },
    maxInputAmount(): string {
      return this.input.asset !== undefined ? this.input.asset.balance : '0';
    },
    buttonClass(): string {
      if (this.actionAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isInfoAvailable(): boolean {
      return this.input.asset !== undefined && notZero(this.input.amount);
    },
    showInfo(): boolean {
      return this.infoExpanded && this.isInfoAvailable;
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    const move = this.tokens.find((t: TokenWithBalance) =>
      sameAddress(t.address, getMoveAssetData(this.networkInfo.network).address)
    );
    if (move) {
      this.input.asset = move;
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteDeposit(): Promise<void> {
      if (this.input.asset === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty input asset"
        );
        return;
      }
      if (!notZero(this.input.amount)) {
        console.error(
          "[deposit-form] can't execute deposit due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await depositCompound(
          this.input.asset,
          this.input.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.depositGasLimit,
          this.approveGasLimit,
          this.selectedGasPrice,
          async () => {
            this.loaderStep = 'Process';
          }
        );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
      }
    },
    async handleUpdateInputAmount(amount: string): Promise<void> {
      this.input.amount = amount;
      if (this.input.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.nativeAmount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Estimate error';
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputNativeAmount(amount: string): Promise<void> {
      this.input.nativeAmount = amount;
      if (this.input.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.amount = divide(
          this.input.nativeAmount,
          this.input.asset.priceUSD
        );

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Estimate error';
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputAsset(asset: TokenWithBalance): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.input.asset = asset;
      if (!price && price !== '0') {
        this.input.asset.priceUSD = price;
      }
      this.input.amount = '';
      this.input.nativeAmount = '';

      this.depositGasLimit = '0';
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.selectedGasPrice = String(newGas.price);
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<void> {
      const resp = await estimateDepositCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        console.error(resp.error);
        this.transferError = 'Estimate error';
        return;
      }
      this.depositGasLimit = resp.actionGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
