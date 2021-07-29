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
          :amount="output.amount"
          :asset="output.asset"
          field-role="input"
          :force-token-array="availableTokens"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxOutputAmount"
          :native-amount="output.nativeAmount"
          use-wallet-tokens
          @update-amount="handleUpdateOutputAmount"
          @update-asset="handleUpdateOutputAsset"
          @update-native-amount="handleUpdateOutputNativeAmount"
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
        <p>{{ infoFooter }}</p>
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

import { mapGetters, mapState } from 'vuex';
import {
  add,
  divide,
  greaterThan,
  multiply,
  notZero,
  sub
} from '@/utils/bigmath';
import { Step } from '../controls/form-loader.vue';
import {
  getAssetsForTreasury,
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import { withdrawCompound } from '@/wallet/actions/treasury/withdraw/withdraw';
import { estimateWithdrawCompound } from '@/wallet/actions/treasury/withdraw/withdrawEstimate';
import { formatToDecimals } from '@/utils/format';
import { sameAddress } from '@/utils/address';
import { GetTokenPrice } from '@/services/thegraph/api';

export default Vue.extend({
  name: 'TreasuryDecreaseBoostForm',
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
      output: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      withdrawGasLimit: '0',
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
      'savingsBalance',
      'usdcPriceInWeth',
      'ethPrice',
      'treasuryBalanceMove',
      'treasuryBalanceLP'
    ]),
    ...mapGetters('account', ['moveNativePrice', 'slpNativePrice']),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Decrease Boost';
    },
    currentTreasuryBalance(): string {
      if (this.output.asset === undefined) {
        return '0';
      }
      return this.getTreasuryTokenBalance(this.output.asset.address);
    },
    availableTokens(): Array<TokenWithBalance> {
      const treasuryTokens = getAssetsForTreasury(
        this.networkInfo.network,
        this.moveNativePrice,
        this.slpNativePrice
      );

      return treasuryTokens
        .map((t) => ({
          ...t,
          balance: this.getTreasuryTokenBalance(t.address)
        }))
        .filter((t) => greaterThan(t.balance, '0'));
    },
    error(): string | undefined {
      if (!notZero(this.output.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.output.amount, this.currentTreasuryBalance)) {
        return 'Inssuficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    newBoost(): string {
      if (this.output.asset === undefined) {
        return '';
      }

      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      let walletAmount = '0';
      let amountTreasury = '0';
      let boostWeight = '1';
      if (sameAddress(this.output.asset.address, move.address)) {
        amountTreasury = this.treasuryBalanceMove;
        boostWeight = '1';
        walletAmount =
          this.tokens.find((t: TokenWithBalance) =>
            sameAddress(t.address, move.address)
          )?.balance ?? '0';
      } else if (sameAddress(this.output.asset.address, slp.address)) {
        amountTreasury = this.treasuryBalanceLP;
        boostWeight = '2.5';
        walletAmount =
          this.tokens.find((t: TokenWithBalance) =>
            sameAddress(t.address, slp.address)
          )?.balance ?? '0';
      }

      //console.log('amountTreasury', amountTreasury);
      //console.log('walletAmount', walletAmount);

      let inputedAmount = this.output.amount || '0';
      if (greaterThan(inputedAmount, amountTreasury)) {
        inputedAmount = amountTreasury;
      }

      let futureBoost = multiply(
        divide(
          sub(amountTreasury, inputedAmount),
          add(amountTreasury, walletAmount)
        ),
        boostWeight
      );

      if (isNaN(+futureBoost)) {
        futureBoost = '0';
      }
      return `${formatToDecimals(futureBoost, 1)}x`;
    },
    showFooter(): boolean {
      return !notZero(this.output.amount);
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

      return '🚪 Decrease Boost';
    },
    availableGasModes(): Array<GasMode> {
      return ['low', 'normal', 'high'];
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.withdrawGasLimit)
      );
      return add(this.approveGasLimit, this.withdrawGasLimit);
    },
    maxOutputAmount(): string {
      return this.savingsBalance ?? '0';
    },
    buttonClass(): string {
      if (this.actionAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isInfoAvailable(): boolean {
      return notZero(this.output.amount);
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && this.isInfoAvailable;
    },
    infoFooter(): string {
      return 'You can withdraw the entire or partial balance. Available balance consists of principal amount you deposited together with the accumulated yield.';
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    const move = this.availableTokens.find((t: TokenWithBalance) =>
      sameAddress(t.address, getMoveAssetData(this.networkInfo.network).address)
    );
    if (move) {
      this.output.asset = move;
    }
  },
  methods: {
    getTreasuryTokenBalance(address: string): string {
      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      if (sameAddress(address, move.address)) {
        return this.treasuryBalanceMove;
      } else if (sameAddress(address, slp.address)) {
        return this.treasuryBalanceLP;
      }
      return '0';
    },
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteDeposit(): Promise<void> {
      if (this.output.asset === undefined) {
        console.error(
          "[withdraw-form] can't execute withdraw due to empty input asset"
        );
        return;
      }
      if (!notZero(this.output.amount)) {
        console.error(
          "[withdraw-form] can't execute withdraw due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await withdrawCompound(
          this.output.asset,
          this.output.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.withdrawGasLimit,
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
    async handleUpdateOutputAsset(asset: TokenWithBalance): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.output.asset = asset;
      if (!price && price !== '0') {
        this.output.asset.priceUSD = price;
      }
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.withdrawGasLimit = '0';
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        await this.tryToEstimate(this.output.amount, this.output.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputNativeAmount(amount: string): Promise<void> {
      this.output.nativeAmount = amount;

      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.output.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.amount = divide(
          this.output.nativeAmount,
          this.output.asset.priceUSD
        );

        await this.tryToEstimate(this.output.amount, this.output.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.selectedGasPrice = String(newGas.price);
    },
    async tryToEstimate(
      outputAmount: string,
      outputAsset: SmallToken
    ): Promise<void> {
      const resp = await estimateWithdrawCompound(
        outputAsset,
        outputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        console.error(resp.error);
        this.transferError = 'Estimate error';
        return;
      }
      this.withdrawGasLimit = resp.actionGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
