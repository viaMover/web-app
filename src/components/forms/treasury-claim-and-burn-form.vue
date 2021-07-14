<template>
  <form class="claim-and-burn form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('treasury.claimAndBurn.lblWhatToBurn')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <div v-if="isPayoutEstimationReady">
      <h2 class="heading">
        {{ $t('treasury.claimAndBurn.lblThePayout') }}
      </h2>
      <div class="reminder">
        {{
          $t('treasury.claimAndBurn.txtThePayout', {
            payout: payoutEstimation.payout,
            burning: payoutEstimation.burning
          })
        }}
      </div>
    </div>
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteClaimAndBurn"
    >
      {{ $t('treasury.claimAndBurn.btnClaimAndBurn') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'TreasuryClaimAndBurnForm',
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
      payoutEstimation: {
        payout: 24841.01,
        burning: 124191.11
      }
    };
  },
  computed: {
    buttonClass(): string {
      return 'button';
    },
    isPayoutEstimationReady(): boolean {
      return this.payoutEstimation !== null;
    }
  },
  methods: {
    handleExecuteClaimAndBurn(): void {
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
