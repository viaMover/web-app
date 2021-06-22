<template>
  <form class="swap form">
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
    <asset-field
      :amount="output.amount"
      :asset="output.asset"
      :exclude-tokens="excludedOutputTokens"
      field-role="output"
      :label="$t('swaps.lblSwapTo')"
      :native-amount="output.nativeAmount"
      @update-amount="handleUpdateOutputAmount"
      @update-asset="handleUpdateOutputAsset"
      @update-native-amount="handleUpdateOutputNativeAmount"
    />
    <div v-if="isSwapInfoAvailable" class="swap-info">
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblMinimumReceived') }}</span>
        <span class="value">{{ info.minimumReceived }}</span>
      </div>
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblRate') }}</span>
        <span class="value">{{ info.rate }}</span>
      </div>
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblEstimatedNetworkFee') }}</span>
        <span class="value">{{ info.estimatedNetworkFee }}</span>
      </div>
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblSmartTreasuryCover') }}</span>
        <span class="value">{{ info.smartTreasuryCover }}</span>
      </div>
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblSlippage') }}</span>
        <span class="value">{{ info.slippage }}</span>
      </div>
      <div class="swap-info-item">
        <span class="title">{{ $t('swaps.lblGasSettings') }}</span>
        <span class="value">{{ info.gasSettings }}</span>
      </div>
    </div>
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteSwap"
    >
      {{ $t('swaps.btnSwap.simple') }}
    </action-button>
    <gas-selector @selected-gas-changed="handleSelectedGasChanged" />
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance, Token } from '@/wallet/types';

import { AssetField, GasSelector } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasPrice } from '@/components/controls/gas-selector.vue';

import { estimateSwapCompound } from '@/wallet/actions/swap/swapEstimate';
import { swapCompound } from '@/wallet/actions/swap/swap';
import { getTransferData, TransferData } from '@/services/0x/api';
import { mapActions, mapState } from 'vuex';
import { divide, fromWei, multiply, notZero, toWei } from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { EmitChartRequestPayload } from '@/store/modules/account/actions/charts';
import { ChartTypes } from '@/services/zerion/charts';

export default Vue.extend({
  name: 'SwapForm',
  components: {
    AssetField,
    ActionButton,
    GasSelector
  },
  data() {
    return {
      info: {
        minimumReceived: 0,
        rate: 0,
        estimatedNetworkFee: 0,
        smartTreasuryCover: 0,
        slippage: 0,
        gasSettings: null
      },
      input: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      output: {
        asset: undefined as Token | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      swapGasLimit: '0',
      transferData: undefined as TransferData | undefined,
      loading: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices'
    ]),
    maxInputAmount(): string {
      return this.input.asset !== undefined ? this.input.asset.balance : '0';
    },
    buttonClass(): string {
      return 'primary';
    },
    isSwapInfoAvailable(): boolean {
      return !!this.input.amount;
    },
    excludedOutputTokens(): Array<Token> {
      if (this.input.asset === undefined) {
        return [];
      }

      return [this.input.asset];
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
  },
  methods: {
    ...mapActions('account', {
      emitChartRequest: 'emitChartRequest'
    }),
    async handleExecuteSwap(): Promise<void> {
      //
      if (this.transferData === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty transfer data"
        );
        return;
      }
      if (this.input.asset === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty input asset"
        );
        return;
      }
      if (this.output.asset === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty output asset"
        );
        return;
      }
      await swapCompound(
        this.input.asset,
        this.output.asset,
        this.input.amount,
        this.transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress,
        this.swapGasLimit,
        this.selectedGasPrice
      );
      //this.$emit('tx-created', 'transaction-hash');
    },
    async handleUpdateInputAmount(amount: string): Promise<void> {
      this.input.amount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true
        );

        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );
        this.output.amount = fromWei(
          transferData.buyAmount,
          this.output.asset.decimals
        );
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        console.error("can't calc data:", err);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputNativeAmount(amount: string): Promise<void> {
      this.input.nativeAmount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.amount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        this.input.amount = divide(
          this.input.nativeAmount,
          this.input.asset.priceUSD
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true
        );

        this.output.amount = fromWei(
          transferData.buyAmount,
          this.output.asset.decimals
        );
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        console.error("can't calc data:", err);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.output.asset.decimals
        );
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        console.error("can't calc data:", err);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputNativeAmount(amount: string): Promise<void> {
      this.output.nativeAmount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.nativeAmount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        return;
      }

      this.loading = true;
      try {
        this.output.amount = divide(
          this.output.nativeAmount,
          this.output.asset.priceUSD
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.output.asset.decimals
        );
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        console.error("can't calc data:", err);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputAsset(asset: TokenWithBalance): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.input.asset = { ...asset, priceUSD: price };
      this.input.amount = '0';
      this.input.nativeAmount = '0';
      this.output.amount = '0';
      this.output.nativeAmount = '0';

      this.swapGasLimit = '0';

      // TODO: remove after test

      this.emitChartRequest({
        assetCode: asset.address,
        nativeCurrency: 'USD',
        ChartTypes: ChartTypes.hour
      } as EmitChartRequestPayload);

      //
    },
    async handleUpdateOutputAsset(asset: Token): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.output.asset = { ...asset, priceUSD: price };
      this.input.amount = '0';
      this.input.nativeAmount = '0';
      this.output.amount = '0';
      this.output.nativeAmount = '0';

      this.swapGasLimit = '0';
    },
    handleSelectedGasChanged(newGas: GasPrice): void {
      this.selectedGasPrice = String(newGas.amount);
    },
    async calcData(
      inputAsset: Token,
      outputAsset: Token,
      amount: string,
      isInput: boolean
    ): Promise<TransferData> {
      const inputInWei = toWei(
        amount,
        isInput ? inputAsset.decimals : outputAsset.decimals
      );
      const transferData = await getTransferData(
        outputAsset.address,
        inputAsset.address,
        inputInWei,
        isInput,
        this.networkInfo.network
      );
      this.transferData = transferData;
      return transferData;
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: Token,
      outputAsset: Token,
      transferData: TransferData
    ): Promise<void> {
      const resp = await estimateSwapCompound(
        inputAsset,
        outputAsset,
        inputAmount,
        transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );

      if (resp.error) {
        console.error("can't esitmate swap");
        return;
      }

      this.swapGasLimit = resp.gasLimit;
    }
  }
});
</script>
