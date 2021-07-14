<template>
  <form class="deposit form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('treasury.increaseBoost.lblWhatToReserve')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <div v-if="isEstimatedBoostReady">
      <h2 class="heading">
        {{ $t('treasury.increaseBoost.lblEstimatedBoost') }}
      </h2>
      <div class="reminder">
        {{
          $t('treasury.increaseBoost.txtEstimatedBoost', {
            estimatedAmount: boostEstimation.estimated,
            currentAmount: boostEstimation.current
          })
        }}
      </div>
    </div>
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteDeposit"
    >
      {{ $t('treasury.increaseBoost.btnIncreaseBoost') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'TreasuryIncreaseBoostForm',
  components: {
    AssetField,
    ActionButton
  },
  data() {
    return {
      assets: [],
      input: {
        asset: null,
        amount: 0,
        nativeAmount: 0
      },
      boostEstimation: {
        estimated: 2.2,
        current: 0.7
      }
    };
  },
  computed: {
    buttonClass(): string {
      return 'button';
    },
    isEstimatedBoostReady(): boolean {
      return this.boostEstimation !== null;
    }
  },
  methods: {
    handleExecuteDeposit(): void {
      //
    },
    handleUpdateInputAmount(amount: number): void {
      this.input.amount = amount;
    },
    handleUpdateInputNativeAmount(amount: number): void {
      this.input.nativeAmount = amount;
    },
    handleUpdateInputAsset(asset: never) {
      this.input.asset = asset;
    }
  }
});
</script>
