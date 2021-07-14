<template>
  <form class="sell form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('nibbleShop.lblSell')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteSell"
    >
      {{ $t('nibbleShop.btnSell.simple') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'NibbleShopSellForm',
  components: {
    AssetField,
    ActionButton
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      assets: [],
      initialAsset: null,
      input: {
        asset: null,
        amount: 0,
        nativeAmount: 0
      }
    };
  },
  computed: {
    ...mapState('account', ['tokens']),
    buttonClass(): string {
      return 'button';
    }
  },
  methods: {
    handleExecuteSell(): void {
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
