<template>
  <form class="swap form">
    <asset-field
      :amount="input.amount"
      :asset="input.asset"
      field-role="input"
      :label="$t('swaps.lblSwapFrom')"
      :native-amount="input.nativeAmount"
      use-wallet-tokens
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <asset-field
      :amount="output.amount"
      :asset="output.asset"
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

import { TokenWithBalance } from '@/store/modules/account/types';

import { AssetField, GasSelector } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasPrice } from '@/components/controls/gas-selector.vue';

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
        asset: null as TokenWithBalance | null,
        amount: 0,
        nativeAmount: 0
      },
      output: {
        asset: null as TokenWithBalance | null,
        amount: 0,
        nativeAmount: 0
      },
      selectedGasPrice: 0
    };
  },
  computed: {
    buttonClass(): string {
      return 'primary';
    },
    isSwapInfoAvailable(): boolean {
      return this.input.amount !== 0;
    }
  },
  methods: {
    handleExecuteSwap(): void {
      //
      this.$emit('tx-created', 'transaction-hash');
    },
    handleUpdateInputAmount(amount: number): void {
      this.input.amount = amount;
    },
    handleUpdateInputNativeAmount(amount: number): void {
      this.input.nativeAmount = amount;
    },
    handleUpdateOutputAmount(amount: number): void {
      this.output.amount = amount;
    },
    handleUpdateOutputNativeAmount(amount: number): void {
      this.output.nativeAmount = amount;
    },
    handleUpdateInputAsset(asset: TokenWithBalance) {
      this.input.asset = asset;
    },
    handleUpdateOutputAsset(asset: TokenWithBalance) {
      this.output.asset = asset;
    },
    handleSelectedGasChanged(newGas: GasPrice): void {
      this.selectedGasPrice = newGas.amount;
    }
  }
});
</script>
