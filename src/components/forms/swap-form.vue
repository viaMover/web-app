<template>
  <form class="swap form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :initial-asset="initialAsset"
      :label="$t('swaps.lblSwapFrom')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <asset-field
      :amount="output.amount"
      :assets="assets"
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
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'SwapForm',
  components: {
    AssetField,
    ActionButton
  },
  data() {
    return {
      assets: [],
      initialAsset: null,
      info: {
        minimumReceived: 0,
        rate: 0,
        estimatedNetworkFee: 0,
        smartTreasuryCover: 0,
        slippage: 0,
        gasSettings: null
      },
      input: {
        asset: null,
        amount: 0,
        nativeAmount: 0
      },
      output: {
        asset: null,
        amount: 0,
        nativeAmount: 0
      }
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
    handleUpdateInputAsset(asset: never) {
      this.input.asset = asset;
    },
    handleUpdateOutputAsset(asset: never) {
      this.output.asset = asset;
    }
  }
});
</script>
