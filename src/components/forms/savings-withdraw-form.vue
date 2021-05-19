<template>
  <form class="withdraw form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('savingsPage.withdraw.lblWhatToWithdraw')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <div v-if="isYieldEstimationReady">
      <h2 class="heading">
        {{ $t('savingsPage.withdraw.lblWhatAboutTheYield') }}
      </h2>
      <div class="reminder">
        {{
          $t('savingsPage.withdraw.txtWhatAboutTheYield', {
            amount: yieldEstimation.amount,
            apy: yieldEstimation.apy
          })
        }}
      </div>
    </div>
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteDeposit"
    >
      {{ $t('savingsPage.withdraw.btnWithdraw') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import AssetField from '@/components/controls/asset-field.vue';
import ActionButton from '@/components/buttons/action-button.vue';

export default Vue.extend({
  name: 'SavingsWithdrawForm',
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
      yieldEstimation: {
        amount: 0,
        apy: 0
      }
    };
  },
  computed: {
    buttonClass(): string {
      return 'primary';
    },
    isYieldEstimationReady(): boolean {
      return this.yieldEstimation !== null;
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
