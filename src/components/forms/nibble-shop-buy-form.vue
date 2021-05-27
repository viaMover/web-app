<template>
  <form class="buy form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('nibbleShop.lblBuyWith')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <action-button :button-class="buttonClass" @button-click="handleExecuteBuy">
      {{ $t('nibbleShop.btnBuy.simple') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AssetField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'NibbleShopBuyForm',
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
      return 'primary';
    }
  },
  methods: {
    handleExecuteBuy(): void {
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
