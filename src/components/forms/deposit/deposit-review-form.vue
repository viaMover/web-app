<template>
  <form autocomplete="off" class="form" @submit.prevent="handleCreateTx">
    <div class="arrow">
      <div class="item">
        <slot name="input-asset-image">
          <token-image
            :address="inputAsset.address"
            :src="inputAsset.logo"
            :symbol="inputAsset.symbol"
            wrapper-class="item-coin"
          />
        </slot>
      </div>
      <div class="item">
        <div class="item-arrow">
          <span />
          <span />
        </div>
      </div>
      <div class="item">
        <slot name="output-asset-image"></slot>
      </div>
    </div>
    <div class="items">
      <div class="item">
        <slot name="input-asset-heading">
          <h2>
            {{ inputAssetHeading }}
            {{ inputAssetSymbol }}
          </h2>
        </slot>
        <span>{{ inputAmountText }}</span>
      </div>
      <div class="item">
        <slot name="output-asset-heading">
          <h2>{{ outputAssetHeading }}</h2>
        </slot>
        <span>
          {{ outputAmountText }}
          {{ outputAssetSymbol }}
        </span>
      </div>
    </div>
    <div v-if="isSubsidizedEnabled">
      <div class="switch">
        <p>{{ $t('forms.lblUseSmartTreasury') }}</p>
        <input
          id="use-smart-treasury"
          hidden="hidden"
          type="checkbox"
          :value="isSmartTreasury"
          @change="handleUpdateIsSmartTreasury($event)"
        />
        <label class="switch-button" for="use-smart-treasury"></label>
      </div>
      <div class="items">
        <div class="item">
          <h2>{{ $t('forms.lblEstimatedGasCost') }}</h2>
          <span>{{ formattedEstimatedGasCost }}</span>
        </div>
      </div>
    </div>
    <slot name="action-button">
      <action-button
        class="button-active black-link"
        propagate-original-event
        type="submit"
      >
        {{ actionButtonText }}
      </action-button>
    </slot>
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { formatToNative } from '@/utils/format';
import { TokenWithBalance } from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'DepositReviewForm',
  components: {
    TokenImage,
    ActionButton
  },
  props: {
    inputAsset: {
      type: Object as PropType<TokenWithBalance>,
      required: true
    },
    isSubsidizedEnabled: {
      type: Boolean,
      default: false
    },
    estimatedGasCost: {
      type: String,
      default: undefined
    },
    isSmartTreasury: {
      type: Boolean,
      required: true
    },
    actionButtonText: {
      type: String,
      default: ''
    },
    inputAssetSymbol: {
      type: String,
      required: true
    },
    inputAmountText: {
      type: String,
      required: true
    },
    inputAssetHeading: {
      type: String,
      required: true
    },
    outputAmountText: {
      type: String,
      required: true
    },
    outputAssetSymbol: {
      type: String,
      required: true
    },
    outputAssetHeading: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedEstimatedGasCost(): string {
      if (this.isSmartTreasury) {
        return '$0.00';
      }

      if (this.estimatedGasCost === undefined) {
        return this.$t('lblNoData') as string;
      }

      return `$${formatToNative(this.estimatedGasCost)}`;
    }
  },
  methods: {
    handleCreateTx(): void {
      this.$emit('create-tx');
    },
    handleUpdateIsSmartTreasury(value: boolean): void {
      this.$emit('update-is-smart-treasury', value);
    }
  }
});
</script>
