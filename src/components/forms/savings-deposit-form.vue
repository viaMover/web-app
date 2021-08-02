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
          <img
            :alt="$t('icon.swapDetailsIconAlt')"
            src="@/assets/images/swap-details.png"
          />
          <span>Deposit Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">Swapping for</p>
            <div class="value">
              <div class="icon getShadow">
                <img
                  :alt="$t('asset.txtAlt', { name: outputUSDCAsset.symbol })"
                  :src="outputUSDCAsset.iconURL"
                />
              </div>
              <span>{{ swappingForString }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Estimated annual earnings</p>
            <p class="info">{{ estimatedAnnualEarning }}</p>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Smart Treasury cover</p>
            <div class="value">
              <span>{{ treasuryCover }}</span>
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

import {
  TokenWithBalance,
  SmallToken,
  SmallTokenInfoWithIcon
} from '@/wallet/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapState } from 'vuex';
import {
  add,
  convertAmountFromNativeValue,
  divide,
  fromWei,
  greaterThan,
  multiply,
  notZero,
  toWei
} from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { Step } from '../controls/form-loader.vue';
import { getUSDCAssetData } from '@/wallet/references/data';
import { depositCompound } from '@/wallet/actions/savings/deposit/deposit';
import { estimateDepositCompound } from '@/wallet/actions/savings/deposit/depositEstimate';
import { formatToNative } from '@/utils/format';
import { sameAddress } from '@/utils/address';
import Web3 from 'web3';

export default Vue.extend({
  name: 'SavingsDepositForm',
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
      useSubsidized: false,
      depositGasLimit: '0',
      approveGasLimit: '0',
      transferData: undefined as TransferData | undefined,
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
      'ethPrice'
    ]),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Deposit';
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
    estimatedAnnualEarning(): string {
      if (this.input.asset === undefined) {
        return '';
      }

      let usdcAmount = '0';

      if (sameAddress(this.input.asset.address, this.outputUSDCAsset.address)) {
        usdcAmount = this.input.amount;
      } else if (this.transferData !== undefined) {
        usdcAmount = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(usdcAmount, usdcNative);
      const apyNative = multiply(
        divide(this.savingsAPY, 100),
        usdcAmountNative
      );

      return `+$${formatToNative(apyNative)}`;
    },
    swappingForString(): string {
      if (this.input.asset === undefined) {
        return '';
      }

      let buyedUSDC = '0';

      if (sameAddress(this.input.asset.address, this.outputUSDCAsset.address)) {
        buyedUSDC = this.input.amount;
      } else if (this.transferData !== undefined) {
        buyedUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      return `${buyedUSDC} ${this.outputUSDCAsset.symbol}`;
    },
    treasuryCover(): string {
      const selectedGasPriceInWEI = Web3.utils.toWei(
        this.selectedGasPrice,
        'Gwei'
      );
      const depositPriceInWEI = multiply(
        selectedGasPriceInWEI,
        this.depositGasLimit
      );

      const depositPriceInEth = Web3.utils.fromWei(depositPriceInWEI, 'ether');
      const depositPriceNative = multiply(depositPriceInEth, this.ethPrice);

      if (this.useSubsidized) {
        return `$${formatToNative(depositPriceNative)}`;
      } else {
        return '$0.00';
      }
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
      return ['treasury', 'low', 'normal', 'high'];
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
      return !this.needTransfer || !!this.transferData;
    },
    needTransfer(): boolean {
      if (this.input.asset === undefined) {
        return true;
      }

      return !sameAddress(
        this.input.asset.address,
        this.outputUSDCAsset.address
      );
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && this.isInfoAvailable;
    },
    infoFooter(): string {
      return 'Once you deposit your assets in savings, Mover is constantly searching for the highest paying option using multiple DeFi protocols. Mover does automatic rebalancing, yield collection, and capital optimization. ';
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    const eth = this.tokens.find((t: TokenWithBalance) => t.address === 'eth');
    if (eth) {
      this.input.asset = eth;
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteDeposit(): Promise<void> {
      if (this.needTransfer && this.transferData === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty transfer data"
        );
        return;
      }
      if (this.input.asset === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty input asset"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await depositCompound(
          this.input.asset,
          this.outputUSDCAsset,
          this.input.amount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.depositGasLimit,
          this.approveGasLimit,
          this.selectedGasPrice,
          this.useSubsidized,
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

        const transferData = await this.calcData(
          this.input.asset,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = err.publicMessage;
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
        }
        this.transferData = undefined;
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

      if (!notZero(this.input.nativeAmount)) {
        this.input.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.amount = convertAmountFromNativeValue(
          this.input.nativeAmount,
          this.input.asset.priceUSD,
          this.input.asset.decimals
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = err.publicMessage;
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
        }
        this.transferData = undefined;
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
      this.transferData = undefined;
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
    },
    async calcData(
      inputAsset: SmallToken,
      amount: string
    ): Promise<TransferData | undefined> {
      const inputInWei = toWei(amount, inputAsset.decimals);

      if (sameAddress(inputAsset.address, this.outputUSDCAsset.address)) {
        this.transferData = undefined;
        return undefined;
      }

      const transferData = await getTransferData(
        this.outputUSDCAsset.address,
        inputAsset.address,
        inputInWei,
        true,
        '0.01',
        this.networkInfo.network
      );
      this.transferData = transferData;
      return transferData;
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: SmallToken,
      transferData: TransferData | undefined
    ): Promise<void> {
      const resp = await estimateDepositCompound(
        inputAsset,
        this.outputUSDCAsset,
        inputAmount,
        transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress,
        this.useSubsidized
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
