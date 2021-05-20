<template>
  <form class="withdraw form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('treasuryPage.decreaseBoost.lblWhatToReturn')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <div v-if="isEstimatedBoostReady">
      <h2 class="heading">
        {{ $t('treasuryPage.decreaseBoost.lblWhatAboutTheBoost') }}
      </h2>
      <div class="reminder">
        {{
          $t('treasuryPage.decreaseBoost.txtWhatAboutTheBoost', {
            estimatedAmount: boostEstimation.estimated,
            currentAmount: boostEstimation.current
          })
        }}
      </div>
    </div>
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteWithdraw"
    >
      {{ $t('treasuryPage.decreaseBoost.btnDecreaseBoost') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'TreasuryDecreaseBoostForm',
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
      return 'primary';
    },
    isEstimatedBoostReady(): boolean {
      return this.boostEstimation !== null;
    }
  },
  methods: {
    handleExecuteWithdraw(): void {
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
